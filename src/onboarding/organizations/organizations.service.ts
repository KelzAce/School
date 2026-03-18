import { Injectable } from '@nestjs/common';

export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  registrationNumber: string;
  contactPerson: string;
  size: OrganizationSize;
  website?: string;
  onboardedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  registrationNumber: string;
  contactPerson: string;
  size: OrganizationSize;
  website?: string;
}

@Injectable()
export class OrganizationsService {
  private readonly organizations: Organization[] = [];
  private nextIdCounter = 1;

  findAll(): Organization[] {
    return this.organizations;
  }

  findOne(id: string): Organization | undefined {
    return this.organizations.find((o) => o.id === id);
  }

  create(dto: CreateOrganizationDto): Organization {
    const organization: Organization = {
      id: `org-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      onboardedAt: new Date().toISOString(),
    };
    this.organizations.push(organization);
    return organization;
  }

  update(
    id: string,
    dto: Partial<CreateOrganizationDto>,
  ): Organization | undefined {
    const organization = this.findOne(id);
    if (!organization) return undefined;
    Object.assign(organization, dto);
    return organization;
  }
}
