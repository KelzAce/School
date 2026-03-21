# School Reimagined

> A modern, competency-based vocational training platform built for the 4th Industrial Revolution. Multi-school, skills-first, industry-integrated.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **API Docs:** Swagger/OpenAPI (available at `/api/docs`)
- **Testing:** Jest (unit + e2e)

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Build for production
npm run build
```

The API runs on port `3002` by default (configurable via `PORT` env variable).

## Current Features

- **Health Check:** `GET /api/health` — returns service status

---

## Feature Roadmap

### Phase 1: Core Operations (Foundation)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Multi-Tenant Architecture** | Single platform serving multiple schools/campuses in a district — each with isolated data but shared infrastructure |
| 2 | **Identity & Access Management** | Role-based access (Admin, Instructor, Student, Industry Partner, Guardian) with JWT auth and OAuth2 social login |
| 3 | **Student Enrollment & Profiles** | Skills-focused profiles — not just demographics but learning goals, prior competencies, career aspirations |
| 4 | **Program & Course Management** | Modular, competency-based program structures instead of rigid semester-locked courses. Programs defined by skill outcomes, not seat-time |
| 5 | **Instructor Management** | Instructor profiles with industry credentials, specializations, and capacity tracking |
| 6 | **Class Scheduling & Cohorts** | Flexible scheduling for workshops, labs, online sessions, and hybrid delivery — not just traditional timetables |

### Phase 2: Competency-Based Learning (4IR Core)

| # | Feature | Description |
|---|---------|-------------|
| 7 | **Skills Taxonomy Engine** | A structured ontology of skills (technical + soft) mapped to industry standards (e.g., O*NET, ESCO). Every course, assessment, and credential links back to specific skills |
| 8 | **Competency Tracking & Progression** | Students advance by demonstrating mastery, not by time in class. Progress dashboards show skill acquisition in real-time |
| 9 | **Digital Badges & Micro-Credentials** | Verifiable, stackable credentials issued on skill mastery. Shareable on LinkedIn/portfolios. Aligns with Open Badges standard |
| 10 | **Portfolio-Based Assessment** | Students submit project work, artifacts, and evidence of competency — replacing or supplementing traditional exams |

### Phase 3: Industry Integration

| # | Feature | Description |
|---|---------|-------------|
| 11 | **Industry Partner Portal** | Companies can post apprenticeship/internship opportunities, review student portfolios, and validate skill credentials |
| 12 | **Workplace Learning Tracker** | Log and verify on-the-job training hours, supervisor assessments, and workplace competency sign-offs |
| 13 | **Skill Gap Analysis** | Compare student skill profiles against industry demand data. Shows students and advisors where to focus next |
| 14 | **Career Pathway Mapping** | Visual skill trees showing how current competencies connect to career outcomes |

### Phase 4: AI & Analytics (Intelligence Layer)

| # | Feature | Description |
|---|---------|-------------|
| 15 | **Learning Analytics Dashboard** | Real-time metrics: enrollment trends, completion rates, skill acquisition velocity, at-risk student detection |
| 16 | **AI-Powered Recommendations** | Personalized course/module suggestions based on career goals, current skills, and learning pace |
| 17 | **Predictive Retention Alerts** | Flag students likely to drop out based on engagement patterns — enabling early advisor intervention |
| 18 | **Outcome Reporting** | Track employment rates, employer satisfaction, and credential-to-job conversion — proving ROI for the institution |

### Phase 5: Communication & Collaboration

| # | Feature | Description |
|---|---------|-------------|
| 19 | **Notification System** | Multi-channel alerts (in-app, email, SMS) for deadlines, schedule changes, and milestones |
| 20 | **Peer Collaboration Spaces** | Project-based group workspaces for team assignments — mirroring modern workplace collaboration |
| 21 | **Mentor Matching** | Connect students with industry mentors based on career goals and skill alignment |

---

## Design Principles

- **Competency over seat-time** — Students prove they can do things, not just that they attended
- **Skills as the universal language** — Everything (courses, credentials, jobs) maps to a shared skill taxonomy
- **Industry as a first-class participant** — Employers are integrated into the learning loop, not an afterthought
- **Data-driven decisions** — Every decision (student, instructor, admin) is backed by real-time analytics
- **Stackable & portable credentials** — Micro-credentials that carry real weight in the job market

## License

UNLICENSED (Private)
