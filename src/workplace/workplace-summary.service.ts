import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkplacePlacement, PlacementStatus } from './entities/workplace-placement.entity.js';
import { WorkplaceLog } from './entities/workplace-log.entity.js';
import { SupervisorAssessment } from './entities/supervisor-assessment.entity.js';
import { WorkplaceCompetencySignOff } from './entities/workplace-competency-signoff.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';

@Injectable()
export class WorkplaceSummaryService {
  constructor(
    @InjectRepository(WorkplacePlacement)
    private readonly placementRepo: Repository<WorkplacePlacement>,
    @InjectRepository(WorkplaceLog)
    private readonly logRepo: Repository<WorkplaceLog>,
    @InjectRepository(SupervisorAssessment)
    private readonly assessmentRepo: Repository<SupervisorAssessment>,
    @InjectRepository(WorkplaceCompetencySignOff)
    private readonly signOffRepo: Repository<WorkplaceCompetencySignOff>,
  ) {}

  async getStudentSummary(tenantId: string, studentProfileId: string) {
    const [placements, recentLogs, signOffs, recentAssessments] = await Promise.all([
      this.placementRepo.find({ where: { tenantId, studentProfileId } }),
      this.logRepo.find({
        where: { tenantId, studentProfileId },
        order: { logDate: 'DESC' },
        take: 5,
      }),
      this.signOffRepo.find({ where: { tenantId, studentProfileId } }),
      this.assessmentRepo.find({
        where: { tenantId, studentProfileId },
        order: { assessedAt: 'DESC' },
        take: 3,
      }),
    ]);

    const totalPlacements = placements.length;
    const activePlacements = placements.filter(p => p.status === PlacementStatus.ACTIVE).length;
    const completedPlacements = placements.filter(p => p.status === PlacementStatus.COMPLETED).length;
    const totalHoursLogged = placements.reduce((sum, p) => sum + Number(p.totalHoursLogged), 0);

    const signOffsByLevel: Record<string, number> = {};
    for (const level of Object.values(ProficiencyLevel)) {
      signOffsByLevel[level] = 0;
    }
    for (const s of signOffs) {
      signOffsByLevel[s.demonstratedLevel] = (signOffsByLevel[s.demonstratedLevel] ?? 0) + 1;
    }

    return {
      studentProfileId,
      totalPlacements,
      activePlacements,
      completedPlacements,
      totalHoursLogged,
      totalSignOffs: signOffs.length,
      signOffsByLevel,
      recentLogs,
      recentAssessments,
    };
  }
}
