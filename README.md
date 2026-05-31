# School Reimagined

> A modern, competency-based vocational training platform built for the 4th Industrial Revolution. Multi-school, skills-first, industry-integrated.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **API Docs:** Swagger/OpenAPI (https://school-xhfr.onrender.com/api/docs)
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

### Phase 1: Core Operations (Foundation) — ✅ Complete (6/6)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1 | **Multi-Tenant Architecture** | ✅ Done | Tenant entity with slug/domain resolution, tenant middleware, tenant-scoped data isolation across all modules |
| 2 | **Identity & Access Management** | ✅ Done | JWT auth with refresh token rotation, role-based guards (super_admin/admin/instructor/student/industry_partner/guardian), password reset flow |
| 3 | **Student Enrollment & Profiles** | ✅ Done | Skills-focused student profiles with learning tracks, prior competencies, career aspirations. Enrollment lifecycle with state machine (pending → active → completed) |
| 4 | **Program & Course Management** | ✅ Done | Modular programs with learning tracks and duration. Courses with difficulty levels, JSONB module structure, async support. Unique codes per tenant |
| 5 | **Instructor Management** | ✅ Done | Instructor profiles with qualifications, certifications (JSONB), specializations, course load limits. Course assignments with role (primary/assistant/guest) and load validation |
| 6 | **Class Scheduling & Cohorts** | ✅ Done | Cohort management with program linkage, capacity limits, and lifecycle (forming → active → completed). Class sessions with day/time scheduling, session types (lecture/lab/workshop/field_work/assessment/async), instructor & room assignment, conflict detection. Cohort enrollments with capacity enforcement and status tracking |

### Phase 2: Competency-Based Learning (4IR Core) — ✅ Complete (4/4)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 7 | **Skills Taxonomy Engine** | ✅ Done | Hierarchical skill ontology with O*NET/ESCO industry standard codes. Skill categories, typed skills (technical/soft/digital/industry), course-skill mappings with proficiency targets, student skill tracking |
| 8 | **Competency Tracking & Progression** | ✅ Done | Competency assessments with auto-result calculation (advanced/competent/not_yet_competent). Mastery records immutably log level achievements. Progress dashboards with per-course skill tracking, mastery timelines, and level distribution |
| 9 | **Digital Badges & Micro-Credentials** | ✅ Done | Badge templates with skill requirements and Open Badges alignment. Badge issuance with SHA-256 verification hashes, evidence tracking, revocation. Stackable micro-credentials bundling badges/skills with public verification endpoints. Public verify-by-hash for badges and credentials |
| 10 | **Portfolio-Based Assessment** | ✅ Done | Students submit project work, artifacts, and evidence of competency. Rubric-driven scoring, draft→submitted→reviewed lifecycle, per-criterion feedback |

### Phase 3: Industry Integration — ✅ Complete (4/4)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 11 | **Industry Partner Portal** | ✅ Done | Companies register profiles, post apprenticeship/internship/job opportunities, receive student applications, review portfolios, and validate credentials |
| 12 | **Workplace Learning Tracker** | ✅ Done | Log on-the-job training hours, supervisor assessments with multi-criteria ratings, workplace competency sign-offs, and student placement summaries |
| 13 | **Skill Gap Analysis** | ✅ Done | Analyze student readiness for opportunities and custom targets with missing/under-leveled skills, readiness scoring, and recommended courses |
| 14 | **Career Pathway Mapping** | ✅ Done | Visual skill trees connecting competencies to career outcomes. Pathway CRUD with sector/tag classification, hierarchical skill tree organised via parent-child skill relationships, student progress tracking with per-skill mastery status and next-steps recommendations, and AI-ranked pathway suggestions based on existing student skills |

### Phase 4: AI & Analytics — 🔄 In Progress (2/4)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 15 | **Learning Analytics Dashboard** | ✅ Done | Real-time metrics: enrollment trends, completion rates, skill acquisition velocity |
| 16 | **AI-Powered Recommendations** | ✅ Done | Personalized course and skill suggestions powered by gap analysis against career pathway requirements — scores courses by skill gap coverage, critical skill priority, and pathway alignment |
| 17 | **Predictive Retention Alerts** | ⬜ Planned | Flag at-risk students based on engagement patterns |
| 18 | **Outcome Reporting** | ⬜ Planned | Track employment rates, credential-to-job conversion |

### Phase 5: Communication & Collaboration — ⬜ Planned

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 19 | **Notification System** | ⬜ Planned | Multi-channel alerts (in-app, email, SMS) |
| 20 | **Peer Collaboration Spaces** | ⬜ Planned | Project-based group workspaces |
| 21 | **Mentor Matching** | ⬜ Planned | Connect students with industry mentors |

### Phase 2 complete — 4/4 ✅ | Phase 3 complete — 4/4 ✅ | Phase 4 in progress — 2/4 🔄

### API Summary (Implemented)

| Endpoint Group | Methods | Description |
|---------------|---------|-------------|
| `/api/tenants` | POST, GET, PATCH, DELETE | Multi-tenant management |
| `/api/auth/*` | POST | Register, login, refresh, logout, password reset |
| `/api/users` | GET, PATCH | User profiles and admin management |
| `/api/students` | POST, GET, PATCH | Student profile CRUD |
| `/api/enrollments` | POST, GET, PATCH | Enrollment lifecycle |
| `/api/programs` | POST, GET, PATCH, DELETE | Program management |
| `/api/courses` | POST, GET, PATCH, DELETE | Course management (with track filter) |
| `/api/instructors` | POST, GET, PATCH | Instructor profile CRUD |
| `/api/course-assignments` | POST, GET, PATCH, DELETE | Instructor-course assignments |
| `/api/skill-categories` | POST, GET, PATCH, DELETE | Skill category management |
| `/api/skills` | POST, GET, PATCH, DELETE | Skill CRUD (with category/type filters) |
| `/api/skill-mappings/*` | POST, GET, PATCH, DELETE | Course-skill and student-skill mappings |
| `/api/cohorts` | POST, GET, PATCH, DELETE | Cohort CRUD with program filter |
| `/api/class-sessions` | POST, GET, PATCH, DELETE | Class session scheduling (by cohort/instructor) |
| `/api/cohort-enrollments` | POST, GET, PATCH, DELETE | Student-to-cohort enrollment with capacity checks |
| `/api/competency-assessments` | POST, GET | Record & query competency assessments (by student, by skill) |
| `/api/progress` | GET | Student progress summaries, course progress, mastery timelines |
| `/api/badges/templates` | POST, GET, PATCH, DELETE | Badge template CRUD (admin) |
| `/api/badges/issue` | POST | Issue badge to student with verification hash |
| `/api/badges/issued` | GET | List & query issued badges (by student) |
| `/api/badges/verify/:hash` | GET | Public badge verification by hash |
| `/api/badges/issued/:id/revoke` | PATCH | Revoke an issued badge |
| `/api/micro-credentials` | POST, GET | Issue & list micro-credentials |
| `/api/micro-credentials/student/:id` | GET | Student's active micro-credentials |
| `/api/micro-credentials/verify/:hash` | GET | Public credential verification |
| `/api/micro-credentials/:id/revoke` | PATCH | Revoke a micro-credential |
| `/api/portfolios` | POST, GET, PATCH, DELETE | Portfolio CRUD + submit workflow |
| `/api/portfolios/:id/submit` | POST | Submit portfolio for review |
| `/api/portfolio-items` | POST, GET, PATCH, DELETE | Portfolio artifacts, reflections, evidence |
| `/api/portfolio-rubrics` | POST, GET, PATCH, DELETE | Rubric templates with weighted criteria |
| `/api/portfolio-assessments` | POST, GET, PATCH | Assess portfolios with per-criterion scoring |
| `/api/portfolio-assessments/:id/criterion-scores` | POST | Add criterion score to assessment |
| `/api/portfolio-assessments/:id/complete` | PATCH | Complete assessment (auto-computes totals) |
| `/api/portfolio-assessments/student/:id/summary` | GET | Student portfolio summary |
| `/api/industry-partners` | POST, GET, PATCH, DELETE | Company profile management |
| `/api/industry-partners/:id/verify` | PATCH | Admin verification of partner |
| `/api/opportunities` | POST, GET, PATCH, DELETE | Internship/apprenticeship/job postings |
| `/api/skill-gap/student/:studentProfileId/opportunity/:opportunityId` | GET | Analyze a student's readiness and skill gaps for a specific opportunity |
| `/api/skill-gap/student/:studentProfileId/custom-target` | POST | Analyze a student's skill gap against custom required skills |
| `/api/skill-gap/student/:studentProfileId/summary` | GET | Cross-opportunity skill gap summary with best-fit opportunities and top missing skills |
| `/api/opportunity-applications` | POST, GET, PATCH | Student applications with status lifecycle |
| `/api/opportunity-applications/:id/withdraw` | PATCH | Withdraw an application |
| `/api/partner-portfolio-reviews` | POST, GET, PATCH, DELETE | Industry review of student portfolios |
| `/api/credential-validations` | POST, GET, PATCH | Partner validation of badges/credentials |
| `/api/workplace-placements` | POST, GET, PATCH, DELETE | On-the-job placement management |
| `/api/workplace-placements/:id/complete` | PATCH | Mark placement as completed |
| `/api/workplace-logs` | POST, GET, PATCH, DELETE | Daily/weekly training log entries |
| `/api/workplace-logs/:id/review` | PATCH | Supervisor review of log entry |
| `/api/supervisor-assessments` | POST, GET, PATCH, DELETE | Multi-criteria supervisor assessments |
| `/api/workplace-competency-signoffs` | POST, GET, DELETE | Supervisor workplace competency sign-offs |
| `/api/workplace-summary/student/:id` | GET | Full workplace summary for a student |
| `/api/career-pathways` | POST, GET | Create and list career pathways (with sector/isPublished filters) |
| `/api/career-pathways/:id` | GET, PATCH, DELETE | Single pathway CRUD |
| `/api/career-pathways/:id/skills` | POST | Add skill requirement to a pathway |
| `/api/career-pathways/:id/skills/:skillId` | DELETE | Remove skill requirement from a pathway |
| `/api/career-pathways/:id/skill-tree` | GET | Hierarchical skill tree for a pathway |
| `/api/career-pathways/:id/student/:studentProfileId/progress` | GET | Student's mastery progress on a specific pathway |
| `/api/career-pathways/student/:studentProfileId/suggestions` | GET | Ranked pathway suggestions based on student's current skills |
| `/api/industry/opportunities/:id/skill-gap/:studentProfileId` | GET | Student skill gap vs opportunity |
| `/api/industry/skill-gap/custom` | POST | Custom target skill gap analysis |
| `/api/industry/skill-gap/:studentProfileId/summary` | GET | Full skill gap summary for student |
| `/api/analytics/overview` | GET | Tenant dashboard: totals, completion rate, top skills |
| `/api/analytics/enrollment-trends` | GET | Enrollment trends over time (day/week/month) |
| `/api/analytics/completion-rates` | GET | Overall and per-program completion rates |
| `/api/analytics/skill-velocity` | GET | Skill mastery acquisition velocity over time |
| `/api/analytics/programs/:id` | GET | Program-specific enrollment and completion stats |
| `/api/recommendations/courses/:studentProfileId` | GET | Personalized course recommendations based on skill gaps |
| `/api/recommendations/courses/:studentProfileId/pathway/:pathwayId` | GET | Course recommendations to advance a specific career pathway |
| `/api/recommendations/skills/:studentProfileId` | GET | Prioritized skill focus recommendations |

---

## Design Principles

- **Competency over seat-time** — Students prove they can do things, not just that they attended
- **Skills as the universal language** — Everything (courses, credentials, jobs) maps to a shared skill taxonomy
- **Industry as a first-class participant** — Employers are integrated into the learning loop, not an afterthought
- **Data-driven decisions** — Every decision (student, instructor, admin) is backed by real-time analytics
- **Stackable & portable credentials** — Micro-credentials that carry real weight in the job market

## License

UNLICENSED (Private)


> A modern reimagining of traditional education — personalized, accessible, and built for the future.

---

## 📚 Table of Contents

- [The Traditional School Structure](#-the-traditional-school-structure)
- [The Problem](#-the-problem)
- [The Solution: School Reimagined](#-the-solution-school-reimagined)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Reimagined Roles](#-reimagined-roles)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏛 The Traditional School Structure

A conventional school is organized around a fixed hierarchy and rigid processes:

| Layer | Traditional Role |
|---|---|
| **Administration** | Principal, Vice-Principal, Department Heads manage operations top-down |
| **Teachers** | Deliver standardized curriculum to fixed class groups |
| **Students** | Passively receive knowledge in age-grouped, same-pace cohorts |
| **Parents** | Receive periodic report cards and attend scheduled meetings |
| **Support Staff** | Counselors, librarians, and admin clerks operate in siloed departments |

### Traditional Pain Points & Next Line of Actions

| # | Pain Point | Description | Next Line of Actions |
|---|---|---|---|
| 1 | 🕐 **Rigid Timetables** | Every student follows the same schedule regardless of learning pace or style | • Implement a flexible scheduling service with personalised daily plans<br>• Introduce asynchronous content delivery to replace mandatory bell schedules<br>• Build an on-demand booking system for live sessions |
| 2 | 📋 **Standardised Curriculum** | One-size-fits-all content leaves advanced learners bored and struggling learners behind | • Develop an AI-powered adaptive learning engine that adjusts difficulty per student<br>• Create elective track offerings (STEM, Arts, Entrepreneurship, Trades)<br>• Enable self-paced modules where learners advance upon demonstrating mastery |
| 3 | 🏢 **Physical Dependency** | Learning is tied to a physical building, limiting access for remote or differently-abled students | • Build a responsive web and mobile app with full offline support<br>• Implement accessibility-first design (screen readers, adjustable text, colour contrast)<br>• Add a multi-language interface with auto-generated translated content |
| 4 | 📊 **Infrequent Feedback** | Progress is measured through periodic high-stakes exams rather than continuous assessment | • Introduce formative micro-assessments throughout each module<br>• Build real-time progress dashboards for students, teachers, and parents<br>• Deploy an automated early-warning system for at-risk students<br>• Launch a skill-based portfolio system for verified competencies |
| 5 | 🔒 **Siloed Communication** | Teachers, parents, and administrators rarely collaborate in real time | • Build a unified communication hub with direct in-app messaging across all stakeholders<br>• Deliver weekly AI-generated progress summaries to parents via email or SMS<br>• Create shared visibility dashboards so all parties see the same data in real time |
| 6 | 🎓 **Credential-Focused Culture** | Success is measured by grades and certificates rather than demonstrated skills | • Shift to a competency-based model with verified digital badges<br>• Introduce project-based learning sprints that produce tangible portfolio artefacts<br>• Establish a peer-to-peer tutoring marketplace where advanced students earn credits |

> **API:** The full structured list of pain points and next actions is also available via the REST API at `GET /pain-points` (individual records at `GET /pain-points/:id`).

---

## ❗ The Problem

Traditional schools were designed for an industrial era — to produce workers who could follow instructions, keep to schedules, and pass standardized tests. In a world that demands creativity, critical thinking, collaboration, and lifelong learning, this model is no longer enough.

Students are diverse. Their learning needs, paces, interests, and life circumstances vary enormously. Yet most school systems continue to treat them as identical units moving through an assembly line.

---

## 💡 The Solution: School Reimagined

**School Reimagined** is a platform that transforms the traditional school into a dynamic, learner-centered ecosystem. It replaces rigid structures with flexible, data-driven experiences tailored to each individual — while preserving the social, collaborative, and mentorship elements that make schools great.

### Vision

> *Every learner gets the right content, at the right time, in the right way — supported by a community that genuinely cares about their growth.*

---

## ✨ Core Features

### 🧑‍🎓 Personalized Learning Paths
- AI-powered adaptive curriculum that adjusts difficulty and topic sequencing based on each student's progress
- Students choose elective tracks (STEM, Arts, Entrepreneurship, Trades, etc.) in addition to core subjects
- Self-paced modules — learners advance when they demonstrate mastery, not when the calendar says so

### 📅 Flexible Scheduling
- Asynchronous content delivery for students who learn best outside traditional hours
- Live sessions (virtual or in-person) bookable on demand for collaborative work, labs, and discussions
- No mandatory bell schedules — structured daily check-ins replace rigid timetables

### 🤝 Collaborative Learning Communities
- Students grouped into mixed-age "Learning Pods" based on interest and skill level, not just birth year
- Peer-to-peer tutoring marketplace where advanced students earn credits by helping others
- Project-based learning sprints that mirror real-world team collaboration

### 📈 Continuous Assessment & Feedback
- Real-time progress dashboards for students, teachers, and parents
- Skill-based portfolio system — students build a verified record of demonstrated competencies
- Formative micro-assessments replace high-stakes terminal exams
- Automated early-warning system flags students at risk of falling behind

### 🌍 Universal Access
- Full mobile and offline support for students in low-bandwidth or remote environments
- Multi-language interface with auto-generated translated content
- Accessibility-first design: screen reader support, adjustable text sizes, colour contrast modes

### 👨‍🏫 Empowered Educators
- Teachers become **Learning Coaches** — freed from repetitive content delivery to focus on mentorship, facilitation, and enrichment
- AI assistant handles routine grading of quizzes, summarizes class performance, and suggests intervention strategies
- Collaborative lesson marketplace where educators share and remix content

### 👪 Parent & Guardian Engagement
- Live access to child's progress, attendance, and upcoming milestones
- Direct in-app messaging with teachers and coaches
- Weekly AI-generated progress summaries delivered via email or SMS

### 🏫 Administration & Operations
- Unified dashboard for principals and admin staff to manage enrollment, staffing, and resources
- Automated timetable generation optimized for room utilization and teacher availability
- Data analytics suite for school-wide performance tracking and strategic planning

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        School Reimagined                     │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Student    │   Teacher /  │   Parent /   │  Admin /       │
│   Portal     │   Coach      │   Guardian   │  Principal     │
│              │   Portal     │   Portal     │  Portal        │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                        API Gateway                           │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Learning │Assessment│Scheduling│Communica-│  Analytics &   │
│ Engine   │ Service  │ Service  │tion Hub  │  Reporting     │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│           AI / ML Engine  (Personalisation & Insights)       │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer (PostgreSQL + Redis)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Reimagined Roles

| Traditional Role | Reimagined Role | Key Shift |
|---|---|---|
| **Principal** | **Community Director** | Facilitates culture and strategy rather than enforcing rules |
| **Teacher** | **Learning Coach** | Guides and mentors instead of lecturing |
| **Student** | **Active Learner** | Drives their own learning journey |
| **Parent** | **Learning Partner** | Engaged partner with real-time visibility |
| **Librarian** | **Knowledge Curator** | Curates and tags digital and physical resources |
| **School Counselor** | **Wellbeing Coach** | Proactive wellbeing support, not just crisis response |
| **IT Department** | **Platform Team** | Maintains and evolves the learning platform continuously |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, TailwindCSS |
| **Mobile** | React Native (iOS & Android) |
| **Backend** | Node.js, NestJS, GraphQL |
| **Database** | PostgreSQL, Redis |
| **AI / ML** | Python, TensorFlow, OpenAI API |
| **Auth** | OAuth 2.0, JWT |
| **Hosting** | AWS / Azure (multi-region) |
| **CI/CD** | GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/KelzAce/School.git
cd School

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Running Tests

```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct and contribution guidelines.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <em>Built with ❤️ to make quality education accessible to every learner, everywhere.</em>
</p>
