import { bootstrapService, ENDPOINTS } from '@app/common';
import { CatalogModule } from './catalog.module';
bootstrapService(CatalogModule, 'catalog-service', ENDPOINTS.CATALOG.port);
