"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const cors_1 = require("cors");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    await app.listen(3001);
    console.log('Example app listening on port 3001!');
}
bootstrap();
//# sourceMappingURL=main.js.map