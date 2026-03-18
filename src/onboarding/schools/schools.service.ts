import { Injectable } from '@nestjs/common';

export type SchoolType = 'primary' | 'secondary' | 'tertiary' | 'vocational';

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  schoolType: SchoolType;
  registrationNumber: string;
  contactPerson: string;
  website?: string;
  onboardedAt: string;
}

export interface CreateSchoolDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  schoolType: SchoolType;
  registrationNumber: string;
  contactPerson: string;
  website?: string;
}

@Injectable()
export class SchoolsService {
  private readonly schools: School[] = [];
  private nextIdCounter = 1;

  findAll(): School[] {
    return this.schools;
  }

  findOne(id: string): School | undefined {
    return this.schools.find((s) => s.id === id);
  }

  create(dto: CreateSchoolDto): School {
    const school: School = {
      id: `sch-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      onboardedAt: new Date().toISOString(),
    };
    this.schools.push(school);
    return school;
  }

  update(id: string, dto: Partial<CreateSchoolDto>): School | undefined {
    const school = this.findOne(id);
    if (!school) return undefined;
    Object.assign(school, dto);
    return school;
  }
}
