import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service.js';
import { TenantStatus } from './entities/tenant.entity.js';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

/**
 * Resolves the current tenant from the X-Tenant-ID header.
 * Validates the tenant exists and is active.
 * Skips tenant resolution for health-check and tenant management routes.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private static readonly EXCLUDED_PATHS = [
    '/api/health',
    '/api/tenants',
    '/api/docs',
  ];

  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const path = req.baseUrl + req.path;

    // Skip tenant resolution for excluded paths
    if (TenantMiddleware.EXCLUDED_PATHS.some((p) => path.startsWith(p))) {
      return next();
    }

    const tenantId = req.headers['x-tenant-id'] as string | undefined;

    if (!tenantId) {
      throw new BadRequestException(
        'Missing X-Tenant-ID header. All requests must include a tenant identifier.',
      );
    }

    const tenant = await this.tenantsService.findOne(tenantId);

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new BadRequestException(
        `Tenant "${tenant.name}" is ${tenant.status}. Access denied.`,
      );
    }

    req.tenantId = tenant.id;
    next();
  }
}
