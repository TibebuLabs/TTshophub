import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CMD } from '@app/common';
import { CatalogService } from './catalog.service';

/**
 * Exposes CatalogService methods as TCP MessagePattern handlers.
 * All business logic lives in CatalogService.
 */
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @MessagePattern(CMD.catalog.list)
  list(@Payload() filters: any) {
    return this.catalogService.list(filters || {});
  }

  @MessagePattern(CMD.catalog.get)
  get(@Payload() data: { id: string }) {
    return this.catalogService.get(data.id);
  }

  @MessagePattern(CMD.catalog.create)
  create(@Payload() data: any) {
    return this.catalogService.create(data);
  }

  @MessagePattern(CMD.catalog.update)
  update(@Payload() data: any) {
    return this.catalogService.update(data);
  }

  @MessagePattern(CMD.catalog.remove)
  remove(@Payload() data: { id: string }) {
    return this.catalogService.remove(data.id);
  }

  @MessagePattern(CMD.catalog.reserve)
  reserve(@Payload() data: { items: any[] }) {
    return this.catalogService.reserve(data.items);
  }

  @MessagePattern(CMD.catalog.release)
  release(@Payload() data: { items: any[] }) {
    return this.catalogService.release(data.items);
  }
}
