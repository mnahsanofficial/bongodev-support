"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MurmurController = void 0;
const common_1 = require("@nestjs/common");
const create_murmur_dto_1 = require("./dto/create-murmur.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const murmur_service_1 = require("./murmur.service");
let MurmurController = class MurmurController {
    constructor(murmurService) {
        this.murmurService = murmurService;
    }
    async createMurmur(createMurmurDto, req) {
        const userId = req.user.userId;
        return this.murmurService.createMurmur(createMurmurDto, userId);
    }
    async getMurmurs(page, limit) {
        return this.murmurService.getMurmurs(page, limit);
    }
    async getMurmurById(id) {
        return this.murmurService.getMurmurById(id);
    }
    async deleteMurmur(id, req) {
        const userId = req.user.userId;
        return this.murmurService.deleteMurmur(id, userId);
    }
    async likeMurmur(murmurId, req) {
        const userId = req.user.userId;
        return this.murmurService.likeMurmur(userId, murmurId);
    }
    async unlikeMurmur(murmurId, req) {
        const userId = req.user.userId;
        return this.murmurService.unlikeMurmur(userId, murmurId);
    }
};
exports.MurmurController = MurmurController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('me/murmurs'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_murmur_dto_1.CreateMurmurDto, Object]),
    __metadata("design:returntype", Promise)
], MurmurController.prototype, "createMurmur", null);
__decorate([
    (0, common_1.Get)('murmurs'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], MurmurController.prototype, "getMurmurs", null);
__decorate([
    (0, common_1.Get)('murmurs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MurmurController.prototype, "getMurmurById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('me/murmurs/:id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MurmurController.prototype, "deleteMurmur", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('murmurs/:id/like'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MurmurController.prototype, "likeMurmur", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('murmurs/:id/like'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MurmurController.prototype, "unlikeMurmur", null);
exports.MurmurController = MurmurController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [murmur_service_1.MurmurService])
], MurmurController);
//# sourceMappingURL=murmur.controller.js.map