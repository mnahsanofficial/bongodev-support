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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Murmur = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const like_entity_1 = require("./like.entity");
let Murmur = class Murmur {
};
exports.Murmur = Murmur;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Murmur.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 5000 }),
    __metadata("design:type", String)
], Murmur.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Murmur.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Murmur.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], Murmur.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], Murmur.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, like => like.murmur),
    __metadata("design:type", Array)
], Murmur.prototype, "likes", void 0);
exports.Murmur = Murmur = __decorate([
    (0, typeorm_1.Entity)()
], Murmur);
//# sourceMappingURL=murmur.entity.js.map