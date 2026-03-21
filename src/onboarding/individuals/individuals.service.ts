import { Injectable } from '@nestjs/common';

export type IndividualRole = 'student' | 'teacher' | 'parent' | 'tutor';

export interface Individual {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: IndividualRole;
  onboardedAt: string;
}

export interface CreateIndividualDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: IndividualRole;
}

@Injectable()
export class IndividualsService {
  private readonly individuals: Individual[] = [];
  private nextIdCounter = 1;

  findAll(): Individual[] {
    return this.individuals;
  }

  findOne(id: string): Individual | undefined {
    return this.individuals.find((i) => i.id === id);
  }

  create(dto: CreateIndividualDto): Individual {
    const individual: Individual = {
      id: `ind-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      onboardedAt: new Date().toISOString(),
    };
    this.individuals.push(individual);
    return individual;
  }

  update(
    id: string,
    dto: Partial<CreateIndividualDto>,
  ): Individual | undefined {
    const individual = this.findOne(id);
    if (!individual) return undefined;
    Object.assign(individual, dto);
    return individual;
  }
}
