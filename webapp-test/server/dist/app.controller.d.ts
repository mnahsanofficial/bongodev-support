import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getTest(query: any): any;
    postTest(body: any): {
        hello: string;
    };
    getHello(): string;
}
