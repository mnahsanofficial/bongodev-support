"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_entity_1 = require("./entities/user.entity");
const murmur_entity_1 = require("./entities/murmur.entity");
const like_entity_1 = require("./entities/like.entity");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const murmur_module_1 = require("./murmur/murmur.module");
const follow_entity_1 = require("./entities/follow.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: 'admin',
                database: 'murmur_app',
                entities: [user_entity_1.User, murmur_entity_1.Murmur, like_entity_1.Like, follow_entity_1.Follow],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, murmur_entity_1.Murmur, like_entity_1.Like, follow_entity_1.Follow]),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            murmur_module_1.MurmurModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map