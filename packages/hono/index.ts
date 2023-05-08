import { routerMdKey, ParameterInformation, ParameterTypes, RouterNode } from "@dikur/http";
import { Context, Hono } from "hono"

export function HonoAdapator(target: new() => any, baseRouter: Hono) {
    let node = Reflect.getOwnMetadata(routerMdKey, target);
    if (!node) {
        throw new Error(`No routing metadata found in ${target.name}`)
    }
    return routerMapper(node, baseRouter);
}

function routerMapper(node: RouterNode, baseRouter = new Hono()) {
    let r = new Hono()

    Object.keys(node.children).forEach(methodName => {
        let details = node.children[methodName];

        if ("children" in details) {
            routerMapper(details, r);
        } else {
            let routeDetails = details;
            r.on(routeDetails.method, routeDetails.path, async (ctx) => {
                let handler = new node.class();
                let parameters = await Promise.all(routeDetails.params.sort((a,b) => a.index - b.index).map(p => honoParamMapper(p, ctx)));
                let result = await handler[methodName](...parameters);
                return result;
            })
        }
    })
    baseRouter.route(node.basePath, r);
    return r;
}

async function honoParamMapper(param: ParameterInformation, ctx: Context) {
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
    if (param.validator) {
        data = await param.validator(data);
    } else if ("validate" in param.reflectedType) {
        data = await param.reflectedType.validate(data);
    }
    return data;
}