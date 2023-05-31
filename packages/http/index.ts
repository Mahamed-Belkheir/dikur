import "reflect-metadata";

export type MiddlewareHandler = (Context: unknown) => Promise<void>



export type RouterNode = {
    basePath: string,
    class: any
    middleware: MiddlewareHandler[],
    children: {
        [key: string]: RouteHandlerNode | RouterNode
    }
}

export type RouteHandlerNode = {
    path: string,
    method: string,
    middleware: MiddlewareHandler[],
    params: ParameterInformation[]
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
    validator?: (data: any) => any,
    reflectedType?: any
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

export function Body(validator?: (data: any) => any) {
    return parameterDecorator(ParameterTypes.Body, validator)
}
export function Query(validator?: (data: any) => any) {
    return parameterDecorator(ParameterTypes.Query, validator)
}
export function Param(validator?: (data: any) => any) {
    return parameterDecorator(ParameterTypes.Param, validator)
}
export function Context() {
    return parameterDecorator(ParameterTypes.Context)
}


function parameterDecorator(type: ParameterTypes, validator?: (data: any) => any) {
    return function(target: Object, key: string, index: number) {
        let reflectedType = Reflect.getMetadata('design:paramtypes', target, key)?.[index];
        if (!validator && reflectedType && "validate" in reflectedType) {
            validator = reflectedType.validate
        }
        let routerNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, target.constructor) || { basePath: "/", children: {} };
        let routeNode: Partial<RouteHandlerNode> = (routerNode.children[key] as RouteHandlerNode) || {params: []};
        routeNode.params?.unshift({
            index,
            type,
            validator,
            reflectedType
        })
        routerNode.children[key] = routeNode as RouteHandlerNode;
        Reflect.defineMetadata(routerMdKey, routerNode, target.constructor)
    }
}

export function Middleware(handler: MiddlewareHandler) {
    return function(target: object, key?: string) {
        let routerNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, target.constructor) || { basePath: "/", children: {} };
        if (!key) {
            routerNode.middleware ??= [];
            routerNode.middleware.push(handler);
        } else {
            let routeNode: Partial<RouteHandlerNode> = (routerNode.children[key] as RouteHandlerNode) || {params: []};
            routeNode.middleware ??= [];
            routeNode.middleware.push(handler);
            routerNode.children[key] = routeNode as RouteHandlerNode;
        }
        Reflect.defineMetadata(routerMdKey, routerNode, target.constructor);
    }
}