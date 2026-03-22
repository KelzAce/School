import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto.js';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
