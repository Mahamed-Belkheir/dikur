import { JSONSchemaType } from "ajv";
import "reflect-metadata";
export type MiddlewareHandler = (...args: any[]) => Promise<any>

export type Schema = Partial<JSONSchemaType<Object>>

export type RouterNode = {
    basePath: string,
    class: any
    middleware?: MiddlewareHandler[],
    children: {
        [key: string]: RouteHandlerNode | RouterNode
    }
}

export type RouteHandlerNode = {
    path: string,
    method: string,
    middleware?: MiddlewareHandler[],
    params: ParameterInformation[],
}

export enum ParameterTypes {
    Context = "context",
    Body = "body",
    Param = "param",
    Query = "query"
}

export type ParameterInformation = {
    type: ParameterTypes,
    index: number,
    schema?: Schema,
    mediatype?: "json" | "form",
}

export type RouteHandler = (...args: any[]) => Promise<any>

export const routerMdKey = "Dikur:router"

export function Http(basePath?: string) {
    return function(target: Object) {
        let routerNode: RouterNode = Reflect.getMetadata(routerMdKey, target) || { basePath: `/${target.constructor.name}`, children: {} };
        routerNode.basePath = basePath || routerNode.basePath;
        routerNode.class = target;
        Reflect.defineMetadata(routerMdKey, routerNode, target);
    }
}

export function NestedRouter() {
    return function(target: Object, key: string) {
        let routerNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, target) || { basePath: "/", children: {} };
        let nestedRouterNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, (target as any)[key]);
        if (!nestedRouterNode) {
            throw new Error(`did not find router metadata in ${(target as any).name}.${key}`)
        }
        routerNode.children[key] = nestedRouterNode;
        Reflect.defineMetadata(routerMdKey, routerNode, target)
    }
}

export function Method(method: string, path?: string) {
    return function(target: Object, key: string, _: TypedPropertyDescriptor<RouteHandler>) {
        let routerNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, target.constructor) || { basePath: "/", children: {} };
        let routeNode: Partial<RouteHandlerNode> = (routerNode.children[key] as RouteHandlerNode) || {params: []};
        routeNode.method = method;
        routeNode.path = path || `/${key}`;
        routerNode.children[key] = routeNode as RouteHandlerNode;
        Reflect.defineMetadata(routerMdKey, routerNode, target.constructor)
    }
}

export function Get(path?: string) {
    return Method("GET", path);
}

export function Post(path?: string) {
    return Method("POST", path);
}
export function Patch(path?: string) {
    return Method("PATCH", path);
}

export function Put(path?: string) {
    return Method("PUT", path);
}

export function Delete(path?: string) {
    return Method("DELETE", path);
}

export function Body(schema?: Schema, mediatype?: "json" | "form") {
    return parameterDecorator(ParameterTypes.Body, schema, mediatype)
}
export function Query(schema?: Schema) {
    return parameterDecorator(ParameterTypes.Query, schema)
}
export function Param(schema?: Schema) {
    return parameterDecorator(ParameterTypes.Param, schema)
}
export function Context() {
    return parameterDecorator(ParameterTypes.Context)
}


function parameterDecorator(type: ParameterTypes, schema?: Schema, mediatype?: "json" | "form") {
    return function(target: Object, key: string, index: number) {
        let routerNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, target.constructor) || { basePath: "/", children: {} };
        let routeNode: Partial<RouteHandlerNode> = (routerNode.children[key] as RouteHandlerNode) || {params: []};
        routeNode.params?.unshift({
            index,
            type,
            schema,
            mediatype
        })
        routerNode.children[key] = routeNode as RouteHandlerNode;
        Reflect.defineMetadata(routerMdKey, routerNode, target.constructor)
    }
}

export function Middleware(handler: MiddlewareHandler) {
    return function(target: object, key?: string) {
        let routerNode: RouterNode = Reflect.getMetadata(routerMdKey, target) || { basePath: "/", children: {} };
        if (!key) {
            routerNode.middleware ??= [];
            routerNode.middleware.push(handler);
        } else {
            routerNode = Reflect.getMetadata(routerMdKey, target.constructor) || { basePath: "/", children: {} };
            let routeNode: Partial<RouteHandlerNode> = (routerNode.children[key] as RouteHandlerNode) || {params: []};
            routeNode.middleware ??= [];
            routeNode.middleware.push(handler);
            routerNode.children[key] = routeNode as RouteHandlerNode;
        }
        Reflect.defineMetadata(routerMdKey, routerNode, target.constructor);
    }
}