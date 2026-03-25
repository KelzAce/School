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

### Phase 2: Competency-Based Learning (4IR Core) — 🔄 In Progress (3/4)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 7 | **Skills Taxonomy Engine** | ✅ Done | Hierarchical skill ontology with O*NET/ESCO industry standard codes. Skill categories, typed skills (technical/soft/digital/industry), course-skill mappings with proficiency targets, student skill tracking |
| 8 | **Competency Tracking & Progression** | ✅ Done | Competency assessments with auto-result calculation (advanced/competent/not_yet_competent). Mastery records immutably log level achievements. Progress dashboards with per-course skill tracking, mastery timelines, and level distribution |
| 9 | **Digital Badges & Micro-Credentials** | ✅ Done | Badge templates with skill requirements and Open Badges alignment. Badge issuance with SHA-256 verification hashes, evidence tracking, revocation. Stackable micro-credentials bundling badges/skills with public verification endpoints. Public verify-by-hash for badges and credentials |
| 10 | **Portfolio-Based Assessment** | ⬜ Planned | Students submit project work, artifacts, and evidence of competency |

### Phase 3: Industry Integration — ⬜ Planned

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 11 | **Industry Partner Portal** | ⬜ Planned | Companies post apprenticeship/internship opportunities, review portfolios, validate credentials |
| 12 | **Workplace Learning Tracker** | ⬜ Planned | Log on-the-job training hours, supervisor assessments, workplace competency sign-offs |
| 13 | **Skill Gap Analysis** | ⬜ Planned | Compare student skills against industry demand data |
| 14 | **Career Pathway Mapping** | ⬜ Planned | Visual skill trees connecting competencies to career outcomes |

### Phase 4: AI & Analytics — ⬜ Planned

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 15 | **Learning Analytics Dashboard** | ⬜ Planned | Real-time metrics: enrollment trends, completion rates, skill acquisition velocity |
| 16 | **AI-Powered Recommendations** | ⬜ Planned | Personalized course suggestions based on career goals and current skills |
| 17 | **Predictive Retention Alerts** | ⬜ Planned | Flag at-risk students based on engagement patterns |
| 18 | **Outcome Reporting** | ⬜ Planned | Track employment rates, credential-to-job conversion |

### Phase 5: Communication & Collaboration — ⬜ Planned

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 19 | **Notification System** | ⬜ Planned | Multi-channel alerts (in-app, email, SMS) |
| 20 | **Peer Collaboration Spaces** | ⬜ Planned | Project-based group workspaces |
| 21 | **Mentor Matching** | ⬜ Planned | Connect students with industry mentors |

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

---

## Design Principles

- **Competency over seat-time** — Students prove they can do things, not just that they attended
- **Skills as the universal language** — Everything (courses, credentials, jobs) maps to a shared skill taxonomy
- **Industry as a first-class participant** — Employers are integrated into the learning loop, not an afterthought
- **Data-driven decisions** — Every decision (student, instructor, admin) is backed by real-time analytics
- **Stackable & portable credentials** — Micro-credentials that carry real weight in the job market

## License

UNLICENSED (Private)
# 🏫 School Reimagined

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
