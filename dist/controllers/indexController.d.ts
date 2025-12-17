import { Request, Response } from 'express';
export declare const home: (req: Request, res: Response) => Promise<void>;
export declare const search: (req: Request, res: Response) => Promise<void>;
export declare const marketsApi: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const favori: (req: Request, res: Response) => Promise<void>;
export declare const toggleFavori: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=indexController.d.ts.map