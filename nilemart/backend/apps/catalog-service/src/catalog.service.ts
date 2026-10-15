import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EVT, OrderItem, rpcError, SVC } from '@app/common';
import { Product } from './product.entity';
import { SEED } from './seed';

/** Filters accepted by the product list endpoint. */
interface ListFilters {
  q?: string;
  category?: string;
  sort?: string;
  max?: string;
}

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectDataSource() private readonly ds: DataSource,
    @Inject(SVC.NOTIFY) private readonly notify: ClientProxy,
  ) {}

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Seed the catalog with sample products on the very first startup so the
   * storefront has content without any manual data entry.
   */
  async onModuleInit(): Promise<void> {
    if (await this.repo.count()) return;

    const products = SEED.map(
      ([name, nameAm, category, price, oldPrice, stock, seller, rating, ratingCount]) =>
        this.repo.create({ name, nameAm, category, price, oldPrice, stock, seller, rating, ratingCount }),
    );

    await this.repo.save(products);
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * List products with optional full-text search, category filter, price cap,
   * and sorting. Returns all active products matching the criteria.
   */
  list(filters: ListFilters): Promise<Product[]> {
    const qb = this.repo.createQueryBuilder('p');

    if (filters.q) {
      qb.andWhere(
        '(p.name ILIKE :q OR p."nameAm" ILIKE :q OR p.seller ILIKE :q OR p.category ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    if (filters.category) {
      qb.andWhere('p.category = :c', { c: filters.category });
    }

    if (filters.max && +filters.max > 0) {
      qb.andWhere('p.price <= :m', { m: +filters.max });
    }

    const sortMap: Record<string, [string, 'ASC' | 'DESC']> = {
      priceAsc:  ['p.price', 'ASC'],
      priceDesc: ['p.price', 'DESC'],
      rating:    ['p.rating', 'DESC'],
      newest:    ['p."createdAt"', 'DESC'],
    };

    const [col, dir] = sortMap[filters.sort || ''] ?? ['p."ratingCount"', 'DESC'];
    return qb.orderBy(col, dir).getMany();
  }

  /**
   * Fetch a single product by ID.
   * Throws 404 if the product does not exist.
   */
  async get(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw rpcError(404, 'Product not found');
    return product;
  }

  /** Create a new product. */
  create(data: Partial<Product>): Promise<Product> {
    return this.repo.save(this.repo.create(data));
  }

  /** Update an existing product's fields. */
  async update(data: Partial<Product> & { id: string }): Promise<Product> {
    const product = await this.get(data.id);
    Object.assign(product, data);
    return this.repo.save(product);
  }

  /** Permanently delete a product. */
  async remove(id: string): Promise<{ ok: boolean }> {
    await this.get(id); // throws 404 if not found
    await this.repo.delete(id);
    return { ok: true };
  }

  // -------------------------------------------------------------------------
  // Stock management
  // -------------------------------------------------------------------------

  /**
   * Atomically check and decrement stock for every item in an order.
   *
   * Uses pessimistic row-level locking inside a transaction so that
   * concurrent orders cannot oversell the same product.
   *
   * Emits a `stock.low` event for each product that drops to 3 or fewer
   * units so the admin can be notified in real time.
   *
   * @param items  List of { productId, qty } pairs from the order.
   * @returns      Enriched order line items (name, price, qty).
   */
  async reserve(
    items: { productId: string; qty: number }[],
  ): Promise<OrderItem[]> {
    const lowStockProducts: Product[] = [];

    const result = await this.ds.transaction(async (manager) => {
      const reserved: OrderItem[] = [];

      for (const item of items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw rpcError(404, 'A product in your cart no longer exists');
        }

        if (product.stock < item.qty) {
          const msg = product.stock
            ? `Only ${product.stock} left of ${product.name}`
            : `${product.name} is out of stock`;
          throw rpcError(409, msg);
        }

        product.stock -= item.qty;
        await manager.save(product);

        reserved.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: item.qty,
        });

        if (product.stock <= 3) {
          lowStockProducts.push(product);
        }
      }

      return reserved;
    });

    // Emit low-stock events outside the transaction to avoid blocking it
    for (const product of lowStockProducts) {
      this.notify.emit(EVT.stockLow, {
        productId: product.id,
        name: product.name,
        stock: product.stock,
      });
    }

    return result;
  }

  /**
   * Return previously reserved stock to the catalog.
   * Called during order cancellation as a saga compensation step.
   */
  async release(
    items: { productId: string; qty: number }[],
  ): Promise<{ ok: boolean }> {
    for (const item of items) {
      await this.repo.increment({ id: item.productId }, 'stock', item.qty);
    }
    return { ok: true };
  }
}
