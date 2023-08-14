import { routerMdKey, ParameterInformation, ParameterTypes, RouterNode } from "@dikur/http";
import Ajv, { ErrorObject } from "ajv";
import Express, { NextFunction, Request, Response, Router } from "express";

type Cls = new () => any;

type Container = (cls: Cls) => InstanceType<Cls>

export type Ctx = {
    req: Request,
    res: Response,
    next: NextFunction
}

export class DikurExpressValidationError extends Error {
    message = "parameter validation failed"
    constructor(public parametertype: string, public errors: ErrorObject[]) {
        super();
    }
}

export function ExpressAdapator(target: new() => any, baseRouter: Express.Router, container: Container = cls => new cls(), ajv = new Ajv() ) {
    let node = Reflect.getOwnMetadata(routerMdKey, target);
    if (!node) {
        throw new Error(`No routing metadata found in ${target.name}`)
    }
    return routerMapper(node, baseRouter, container, ajv);
}

export function routerMapper(node: RouterNode, router: Express.Router, container: Container, ajv: Ajv): Express.Router {
    let r = Router();

    if (node.middleware) {
        r.use(...node.middleware);
    }

    Object.keys(node.children).map(methodName => {
        let details = node.children[methodName];
        if ("children" in details) {
            routerMapper(details, r, container, ajv);
        } else {
            let routeDetails = details;
            let middleware = routeDetails.middleware || [];
            r[routeDetails.method.toLowerCase() as "get"](routeDetails.path, ...middleware, async (req, res, next) => {
                let handler = container(node.class);
                let parameters = await Promise.all(routeDetails.params.sort((a,b) => a.index - b.index).map(p => expressParamMapper(p, {req, res, next}, ajv)));
                try {
                    await handler[methodName](...parameters);
                } catch (e) {
                    next(e);
                }
            })
        }
    })

    router.use(node.basePath, r);
    return r;
}

async function expressParamMapper(param: ParameterInformation, ctx: Ctx, ajv: Ajv) {
    let data: any;
    switch (param.type) {
        case ParameterTypes.Context:
            return ctx;
        case ParameterTypes.Body:
            data = ctx.req.body;
            break;
        case ParameterTypes.Param:
            data = ctx.req.params;
            break;
        case ParameterTypes.Query:
            data = ctx.req.query;
            break;
    }
    if (param.schema) {
        let v = ajv.compile(param.schema);
        
        if (!v(data)) {
            return Promise.reject(new DikurExpressValidationError(param.type, v.errors!.slice(0)));
        }
    }
    return data;
}