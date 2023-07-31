import { routerMdKey, ParameterInformation, ParameterTypes, RouterNode } from "@dikur/http";
import Ajv, { ErrorObject } from "ajv";
import { Context, Hono } from "hono";

type Cls = new () => any;

type Container = (cls: Cls) => InstanceType<Cls>

export class DikurHonoValidationError extends Error {
    message = "parameter validation failed"
    constructor(public parametertype: string, public errors: ErrorObject[]) {
        super();
    }
}

export function HonoAdapator(target: new() => any, baseRouter: Hono, container: Container = cls => new cls(), ajv = new Ajv() ) {
    let node = Reflect.getOwnMetadata(routerMdKey, target);
    if (!node) {
        throw new Error(`No routing metadata found in ${target.name}`)
    }
    return routerMapper(node, baseRouter, container, ajv);
}

function routerMapper(node: RouterNode, baseRouter = new Hono(), container: Container, ajv: Ajv) {
    let r = new Hono()

    if (node.middleware) {
        r.use("/*", ...node.middleware)
    }
    Object.keys(node.children).forEach(methodName => {
        let details = node.children[methodName];

        if ("children" in details) {
            routerMapper(details, r, container, ajv);
        } else {
            let routeDetails = details;
            let middleware = routeDetails.middleware || [];
            r.on(routeDetails.method, routeDetails.path, ...middleware, async (ctx) => {
                let handler = container(node.class);
                let parameters = await Promise.all(routeDetails.params.sort((a,b) => a.index - b.index).map(p => honoParamMapper(p, ctx, ajv)));
                let result = await handler[methodName](...parameters);
                return result;
            })
        }
    })
    baseRouter.route(node.basePath, r);
    return r;
}

async function honoParamMapper(param: ParameterInformation, ctx: Context, ajv: Ajv) {
    let data: any;
    switch (param.type) {
        case ParameterTypes.Context:
            return ctx;
        case ParameterTypes.Body:
            let header = ctx.req.header('Content-Type');
            if (header?.includes('form')) {
                data = await ctx.req.parseBody();
                break;
            }
            if (header?.includes("json")) {
                data = await ctx.req.json();
                break;
            }
            break;
        case ParameterTypes.Param:
            data = ctx.req.param();
            break;
        case ParameterTypes.Query:
            data = ctx.req.query();
            break;
    }
    if (param.schema) {
        let v = ajv.compile(param.schema);
        
        if (!v(data)) {
            return Promise.reject(new DikurHonoValidationError(param.type, v.errors!.slice(0)));
        }
    }
    return data;
}