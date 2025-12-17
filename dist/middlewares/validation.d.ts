import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
export declare const validateBody: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateParams: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateQuery: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
declare const _default: {
    validateBody: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    validateParams: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    validateQuery: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
};
export default _default;
//# sourceMappingURL=validation.d.ts.map