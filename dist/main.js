"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_js_1 = require("./app.module.js");
const http_exception_filter_js_1 = require("./common/filters/http-exception.filter.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_js_1.GlobalExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('School Reimagined API')
        .setDescription(`
A competency-based vocational training platform built for the 4th Industrial Revolution.

### Live Docs
https://school-xhfr.onrender.com/api/docs

---

## Available Features

### Core Operations
- Multi-tenant architecture
- Authentication & role-based access control
- Student enrollment & lifecycle management
- Program and course management
- Instructor management
- Cohort and class scheduling

### Competency-Based Learning
- Skills taxonomy (O*NET / ESCO aligned)
- Competency assessments & mastery tracking
- Student progress dashboards
- Digital badges & micro-credentials with verification

---

## Coming Soon

### Learning Experience
- Portfolio-based assessment
- Project artifact submissions

### Industry Integration
- Industry partner portal
- Workplace learning tracking
- Skill gap analysis
- Career pathway mapping

### AI & Analytics
- Learning analytics dashboards
- AI-powered recommendations
- Predictive retention alerts

---

## Authentication

- Use **Bearer Token (JWT)** for protected routes
- Include **X-Tenant-ID** header for all requests

Example:
\`\`\`
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
\`\`\`
`)
        .setVersion('1.0')
        .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'tenant-id')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = Number(process.env.PORT) || 3002;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map