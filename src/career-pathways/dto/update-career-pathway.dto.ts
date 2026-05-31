import { PartialType } from '@nestjs/swagger';
import { CreateCareerPathwayDto } from './create-career-pathway.dto.js';

export class UpdateCareerPathwayDto extends PartialType(CreateCareerPathwayDto) {}
