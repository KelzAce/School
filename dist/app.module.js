"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const tenants_module_js_1 = require("./tenants/tenants.module.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const users_module_js_1 = require("./users/users.module.js");
const pain_points_module_js_1 = require("./pain-points/pain-points.module.js");
const students_module_js_1 = require("./students/students.module.js");
const courses_module_js_1 = require("./courses/courses.module.js");
const schedules_module_js_1 = require("./schedules/schedules.module.js");
const assessments_module_js_1 = require("./assessments/assessments.module.js");
const messages_module_js_1 = require("./messages/messages.module.js");
const onboarding_module_js_1 = require("./onboarding/onboarding.module.js");
const jwt_auth_guard_js_1 = require("./auth/guards/jwt-auth.guard.js");
const database_config_js_1 = __importDefault(require("./config/database.config.js"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_js_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('database.host'),
                    port: config.get('database.port'),
                    username: config.get('database.username'),
                    password: config.get('database.password'),
                    database: config.get('database.database'),
                    synchronize: config.get('database.synchronize'),
                    logging: config.get('database.logging'),
                    autoLoadEntities: true,
                }),
            }),
            tenants_module_js_1.TenantsModule,
            auth_module_js_1.AuthModule,
            users_module_js_1.UsersModule,
            pain_points_module_js_1.PainPointsModule,
            students_module_js_1.StudentsModule,
            courses_module_js_1.CoursesModule,
            schedules_module_js_1.SchedulesModule,
            assessments_module_js_1.AssessmentsModule,
            messages_module_js_1.MessagesModule,
            onboarding_module_js_1.OnboardingModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [
            app_service_js_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_js_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map