import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OutcomesService } from './outcomes.service.js';
import { StudentProfile, StudentStatus } from '../students/entities/student-profile.entity.js';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity.js';
import { WorkplacePlacement, PlacementStatus, PlacementType } from '../workplace/entities/workplace-placement.entity.js';
import { OpportunityApplication, ApplicationStatus } from '../industry/entities/opportunity-application.entity.js';
import { IssuedBadge, BadgeStatus } from '../badges/entities/issued-badge.entity.js';
import { MicroCredential, CredentialStatus } from '../badges/entities/micro-credential.entity.js';

const createMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
});

const tenantId = '00000000-0000-0000-0000-000000000001';

describe('OutcomesService', () => {
  let service: OutcomesService;
  let studentProfileRepo: ReturnType<typeof createMockRepo>;
  let enrollmentRepo: ReturnType<typeof createMockRepo>;
  let placementRepo: ReturnType<typeof createMockRepo>;
  let applicationRepo: ReturnType<typeof createMockRepo>;
  let badgeRepo: ReturnType<typeof createMockRepo>;
  let credentialRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    studentProfileRepo = createMockRepo();
    enrollmentRepo = createMockRepo();
    placementRepo = createMockRepo();
    applicationRepo = createMockRepo();
    badgeRepo = createMockRepo();
    credentialRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutcomesService,
        { provide: getRepositoryToken(StudentProfile), useValue: studentProfileRepo },
        { provide: getRepositoryToken(Enrollment), useValue: enrollmentRepo },
        { provide: getRepositoryToken(WorkplacePlacement), useValue: placementRepo },
        { provide: getRepositoryToken(OpportunityApplication), useValue: applicationRepo },
        { provide: getRepositoryToken(IssuedBadge), useValue: badgeRepo },
        { provide: getRepositoryToken(MicroCredential), useValue: credentialRepo },
      ],
    }).compile();

    service = module.get<OutcomesService>(OutcomesService);
  });

  // --- getOverview tests ---

  it('getOverview — returns zeros when no data', async () => {
    studentProfileRepo.find.mockResolvedValue([]);
    enrollmentRepo.find.mockResolvedValue([]);
    applicationRepo.find.mockResolvedValue([]);
    placementRepo.find.mockResolvedValue([]);
    badgeRepo.find.mockResolvedValue([]);
    credentialRepo.find.mockResolvedValue([]);

    const result = await service.getOverview(tenantId, {});

    expect(result.totalStudents).toBe(0);
    expect(result.graduates).toBe(0);
    expect(result.graduationRate).toBe(0);
    expect(result.activeEnrollments).toBe(0);
    expect(result.completedEnrollments).toBe(0);
    expect(result.acceptedApplications).toBe(0);
    expect(result.completedPlacements).toBe(0);
    expect(result.activePlacements).toBe(0);
    expect(result.issuedBadges).toBe(0);
    expect(result.activeMicroCredentials).toBe(0);
  });

  it('getOverview — correctly counts graduates and rate', async () => {
    const students = [
      { id: '1', tenantId, status: StudentStatus.GRADUATED },
      { id: '2', tenantId, status: StudentStatus.GRADUATED },
      { id: '3', tenantId, status: StudentStatus.ENROLLED },
      { id: '4', tenantId, status: StudentStatus.ENROLLED },
      { id: '5', tenantId, status: StudentStatus.APPLICANT },
    ] as StudentProfile[];

    studentProfileRepo.find.mockResolvedValue(students);
    enrollmentRepo.find.mockResolvedValue([]);
    applicationRepo.find.mockResolvedValue([]);
    placementRepo.find.mockResolvedValue([]);
    badgeRepo.find.mockResolvedValue([]);
    credentialRepo.find.mockResolvedValue([]);

    const result = await service.getOverview(tenantId, {});

    expect(result.totalStudents).toBe(5);
    expect(result.graduates).toBe(2);
    expect(result.graduationRate).toBe(40);
  });

  it('getOverview — counts accepted applications', async () => {
    studentProfileRepo.find.mockResolvedValue([]);
    enrollmentRepo.find.mockResolvedValue([]);
    placementRepo.find.mockResolvedValue([]);
    badgeRepo.find.mockResolvedValue([]);
    credentialRepo.find.mockResolvedValue([]);

    const apps = [
      { id: '1', tenantId, studentProfileId: 's1', status: ApplicationStatus.PENDING, createdAt: new Date('2024-06-01') },
      { id: '2', tenantId, studentProfileId: 's2', status: ApplicationStatus.SHORTLISTED, createdAt: new Date('2024-06-02') },
      { id: '3', tenantId, studentProfileId: 's3', status: ApplicationStatus.ACCEPTED, createdAt: new Date('2024-06-03') },
      { id: '4', tenantId, studentProfileId: 's4', status: ApplicationStatus.ACCEPTED, createdAt: new Date('2024-06-04') },
    ] as OpportunityApplication[];
    applicationRepo.find.mockResolvedValue(apps);

    const result = await service.getOverview(tenantId, {});
    expect(result.acceptedApplications).toBe(2);
  });

  it('getOverview — date filter applies to issuedBadges', async () => {
    studentProfileRepo.find.mockResolvedValue([]);
    enrollmentRepo.find.mockResolvedValue([]);
    applicationRepo.find.mockResolvedValue([]);
    placementRepo.find.mockResolvedValue([]);
    credentialRepo.find.mockResolvedValue([]);

    const badges = [
      { id: '1', tenantId, studentProfileId: 's1', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-01-15') },
      { id: '2', tenantId, studentProfileId: 's2', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-03-10') },
      { id: '3', tenantId, studentProfileId: 's3', status: BadgeStatus.ISSUED, issuedAt: new Date('2023-12-01') },
    ] as IssuedBadge[];
    badgeRepo.find.mockResolvedValue(badges);

    const result = await service.getOverview(tenantId, { from: '2024-01-01', to: '2024-12-31' });
    expect(result.issuedBadges).toBe(2);
  });

  // --- getGraduateReport tests ---

  it('getGraduateReport — groups graduates by learning track', async () => {
    const students = [
      { id: '1', tenantId, status: StudentStatus.GRADUATED, learningTrack: 'STEM', enrollmentDate: new Date('2024-01-01') },
      { id: '2', tenantId, status: StudentStatus.GRADUATED, learningTrack: 'STEM', enrollmentDate: new Date('2024-02-01') },
      { id: '3', tenantId, status: StudentStatus.GRADUATED, learningTrack: 'Trades', enrollmentDate: new Date('2024-03-01') },
      { id: '4', tenantId, status: StudentStatus.ENROLLED, learningTrack: 'STEM', enrollmentDate: new Date('2024-04-01') },
    ] as StudentProfile[];
    studentProfileRepo.find.mockResolvedValue(students);
    enrollmentRepo.find.mockResolvedValue([]);

    const result = await service.getGraduateReport(tenantId, {});

    expect(result.byLearningTrack).toEqual({ STEM: 2, Trades: 1 });
    expect(result.totalGraduates).toBe(3);
  });

  it('getGraduateReport — generates byMonth sorted ASC', async () => {
    const students = [
      { id: '1', tenantId, status: StudentStatus.GRADUATED, learningTrack: 'STEM', enrollmentDate: new Date('2024-03-15') },
      { id: '2', tenantId, status: StudentStatus.GRADUATED, learningTrack: 'STEM', enrollmentDate: new Date('2024-01-10') },
      { id: '3', tenantId, status: StudentStatus.GRADUATED, learningTrack: 'Arts', enrollmentDate: new Date('2024-01-20') },
    ] as StudentProfile[];
    studentProfileRepo.find.mockResolvedValue(students);
    enrollmentRepo.find.mockResolvedValue([]);

    const result = await service.getGraduateReport(tenantId, {});

    expect(result.byMonth).toEqual([
      { month: '2024-01', count: 2 },
      { month: '2024-03', count: 1 },
    ]);
  });

  it('getGraduateReport — completionsByProgram aggregates correctly', async () => {
    studentProfileRepo.find.mockResolvedValue([]);

    const enrollments = [
      { id: '1', tenantId, studentProfileId: 's1', programId: 'p1', status: EnrollmentStatus.COMPLETED },
      { id: '2', tenantId, studentProfileId: 's2', programId: 'p1', status: EnrollmentStatus.ACTIVE },
      { id: '3', tenantId, studentProfileId: 's3', programId: 'p1', status: EnrollmentStatus.WITHDRAWN },
      { id: '4', tenantId, studentProfileId: 's4', programId: 'p2', status: EnrollmentStatus.COMPLETED },
      { id: '5', tenantId, studentProfileId: 's5', programId: 'p2', status: EnrollmentStatus.COMPLETED },
    ] as Enrollment[];
    enrollmentRepo.find.mockResolvedValue(enrollments);

    const result = await service.getGraduateReport(tenantId, {});

    const p1 = result.completionsByProgram.find(p => p.programId === 'p1');
    const p2 = result.completionsByProgram.find(p => p.programId === 'p2');
    expect(p1).toEqual({ programId: 'p1', completedCount: 1, activeCount: 1, withdrawnCount: 1 });
    expect(p2).toEqual({ programId: 'p2', completedCount: 2, activeCount: 0, withdrawnCount: 0 });
  });

  // --- getEmploymentReport tests ---

  it('getEmploymentReport — applicationsByStatus counts all statuses', async () => {
    const apps = [
      { id: '1', tenantId, studentProfileId: 's1', status: ApplicationStatus.PENDING, createdAt: new Date() },
      { id: '2', tenantId, studentProfileId: 's2', status: ApplicationStatus.PENDING, createdAt: new Date() },
      { id: '3', tenantId, studentProfileId: 's3', status: ApplicationStatus.ACCEPTED, createdAt: new Date() },
      { id: '4', tenantId, studentProfileId: 's4', status: ApplicationStatus.REJECTED, createdAt: new Date() },
    ] as OpportunityApplication[];
    applicationRepo.find.mockResolvedValue(apps);
    placementRepo.find.mockResolvedValue([]);
    studentProfileRepo.find.mockResolvedValue([]);
    enrollmentRepo.find.mockResolvedValue([]);

    const result = await service.getEmploymentReport(tenantId, {});

    expect(result.applicationsByStatus[ApplicationStatus.PENDING]).toBe(2);
    expect(result.applicationsByStatus[ApplicationStatus.ACCEPTED]).toBe(1);
    expect(result.applicationsByStatus[ApplicationStatus.REJECTED]).toBe(1);
  });

  it('getEmploymentReport — placementsByType groups placements correctly', async () => {
    applicationRepo.find.mockResolvedValue([]);
    studentProfileRepo.find.mockResolvedValue([]);
    enrollmentRepo.find.mockResolvedValue([]);

    const placements = [
      { id: '1', tenantId, studentProfileId: 's1', type: PlacementType.INTERNSHIP, status: PlacementStatus.ACTIVE },
      { id: '2', tenantId, studentProfileId: 's2', type: PlacementType.INTERNSHIP, status: PlacementStatus.COMPLETED },
      { id: '3', tenantId, studentProfileId: 's3', type: PlacementType.APPRENTICESHIP, status: PlacementStatus.ACTIVE },
    ] as WorkplacePlacement[];
    placementRepo.find.mockResolvedValue(placements);

    const result = await service.getEmploymentReport(tenantId, {});

    expect(result.placementsByType[PlacementType.INTERNSHIP]).toBe(2);
    expect(result.placementsByType[PlacementType.APPRENTICESHIP]).toBe(1);
  });

  it('getEmploymentReport — employmentRate calculated correctly', async () => {
    const students = [
      { id: 's1', tenantId, status: StudentStatus.GRADUATED },
      { id: 's2', tenantId, status: StudentStatus.GRADUATED },
      { id: 's3', tenantId, status: StudentStatus.GRADUATED },
      { id: 's4', tenantId, status: StudentStatus.GRADUATED },
    ] as StudentProfile[];
    studentProfileRepo.find.mockResolvedValue(students);

    const apps = [
      { id: 'a1', tenantId, studentProfileId: 's1', status: ApplicationStatus.ACCEPTED, createdAt: new Date() },
    ] as OpportunityApplication[];
    applicationRepo.find.mockResolvedValue(apps);

    placementRepo.find.mockResolvedValue([]);
    enrollmentRepo.find.mockResolvedValue([]);

    const result = await service.getEmploymentReport(tenantId, {});

    // 1 employed out of 4 graduates = 25%
    expect(result.employmentRate).toBe(25);
  });

  // --- getCredentialReport tests ---

  it('getCredentialReport — counts badges and micro-credentials correctly', async () => {
    const badges = [
      { id: '1', tenantId, studentProfileId: 's1', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-01-01') },
      { id: '2', tenantId, studentProfileId: 's2', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-02-01') },
      { id: '3', tenantId, studentProfileId: 's3', status: BadgeStatus.REVOKED, issuedAt: new Date('2024-03-01') },
    ] as IssuedBadge[];
    badgeRepo.find.mockResolvedValue(badges);

    const credentials = [
      { id: '1', tenantId, studentProfileId: 's4', status: CredentialStatus.ACTIVE, issuedAt: new Date('2024-01-01') },
      { id: '2', tenantId, studentProfileId: 's5', status: CredentialStatus.REVOKED, issuedAt: new Date('2024-02-01') },
    ] as MicroCredential[];
    credentialRepo.find.mockResolvedValue(credentials);
    applicationRepo.find.mockResolvedValue([]);

    const result = await service.getCredentialReport(tenantId, {});

    expect(result.totalIssuedBadges).toBe(2);
    expect(result.revokedBadges).toBe(1);
    expect(result.activeMicroCredentials).toBe(1);
    expect(result.revokedMicroCredentials).toBe(1);
  });

  it('getCredentialReport — badgesIssuedByMonth sorted correctly', async () => {
    const badges = [
      { id: '1', tenantId, studentProfileId: 's1', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-03-15') },
      { id: '2', tenantId, studentProfileId: 's2', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-01-20') },
      { id: '3', tenantId, studentProfileId: 's3', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-01-05') },
    ] as IssuedBadge[];
    badgeRepo.find.mockResolvedValue(badges);
    credentialRepo.find.mockResolvedValue([]);
    applicationRepo.find.mockResolvedValue([]);

    const result = await service.getCredentialReport(tenantId, {});

    expect(result.badgesIssuedByMonth).toEqual([
      { month: '2024-01', count: 2 },
      { month: '2024-03', count: 1 },
    ]);
  });

  it('getCredentialReport — studentsWithJobAfterCredential counts conversion', async () => {
    const badges = [
      { id: 'b1', tenantId, studentProfileId: 's1', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-01-10') },
      { id: 'b2', tenantId, studentProfileId: 's2', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-01-15') },
    ] as IssuedBadge[];
    badgeRepo.find.mockResolvedValue(badges);
    credentialRepo.find.mockResolvedValue([]);

    const apps = [
      // s1: application created AFTER badge → counts as conversion
      { id: 'a1', tenantId, studentProfileId: 's1', status: ApplicationStatus.ACCEPTED, createdAt: new Date('2024-03-01') },
      // s2: application created BEFORE badge → NOT counted
      { id: 'a2', tenantId, studentProfileId: 's2', status: ApplicationStatus.ACCEPTED, createdAt: new Date('2023-12-01') },
    ] as OpportunityApplication[];
    applicationRepo.find.mockResolvedValue(apps);

    const result = await service.getCredentialReport(tenantId, {});

    expect(result.studentsWithJobAfterCredential).toBe(1);
    expect(result.credentialToJobConversionRate).toBe(50); // 1/2 * 100
  });

  it('getCredentialReport — studentsWithCredentials counts distinct students', async () => {
    // s1 has 2 badges — should be counted once
    const badges = [
      { id: 'b1', tenantId, studentProfileId: 's1', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-01-01') },
      { id: 'b2', tenantId, studentProfileId: 's1', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-02-01') },
      { id: 'b3', tenantId, studentProfileId: 's2', status: BadgeStatus.ISSUED, issuedAt: new Date('2024-03-01') },
    ] as IssuedBadge[];
    badgeRepo.find.mockResolvedValue(badges);
    credentialRepo.find.mockResolvedValue([]);
    applicationRepo.find.mockResolvedValue([]);

    const result = await service.getCredentialReport(tenantId, {});

    expect(result.studentsWithCredentials).toBe(2); // s1 and s2 — s1 counted once
  });
});
