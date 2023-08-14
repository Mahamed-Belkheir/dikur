import { ParameterInformation, RouteHandler, RouteHandlerNode, RouterNode, Schema, routerMdKey } from "@dikur/http";
import { HttpCode, MediaTypeObject, OpenAPI, ParameterObject, PathsObject, RequestBodyObject, ResponsesObject, SecurityRequirementObject } from "./types";

type ExtendedRouteHandlerNode = RouteHandlerNode & {
    responses: ResponsesObject
    securityScheme: SecurityRequirementObject[]
}

export function Secured(options: SecurityRequirementObject) {
    return function(target: Object, key: string, _: TypedPropertyDescriptor<RouteHandler>) {
        let routerNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, target.constructor) || { basePath: "/", children: {} };
        let routeNode: Partial<ExtendedRouteHandlerNode & {}> = (routerNode.children[key] as ExtendedRouteHandlerNode) || {params: [], responses: {}, securityScheme: []};
        routeNode.securityScheme ??= [];
        routeNode.securityScheme.push(options);
        routerNode.children[key] = routeNode as ExtendedRouteHandlerNode;
        Reflect.defineMetadata(routerMdKey, routerNode, target.constructor)
    }
}

export function Response(code: HttpCode, type: string, description = "auto generated response", schema?: Schema) {
    return function(target: Object, key: string, _: TypedPropertyDescriptor<RouteHandler>) {
        let routerNode: RouterNode = Reflect.getOwnMetadata(routerMdKey, target.constructor) || { basePath: "/", children: {} };
        let routeNode: Partial<ExtendedRouteHandlerNode & {}> = (routerNode.children[key] as ExtendedRouteHandlerNode) || {params: [], responses: {}};
        routeNode.responses ??= {};
        routeNode.responses[code] = {
            content: {[type]: { schema }},
            description,
        }
        routerNode.children[key] = routeNode as ExtendedRouteHandlerNode;
        Reflect.defineMetadata(routerMdKey, routerNode, target.constructor)
    }
}

export function OpenAPIAdapter(api: any, config: OpenAPI): OpenAPI {
    let node: RouterNode = Reflect.getOwnMetadata(routerMdKey, api)
    let paths = getPathValues(node);
    let doc: OpenAPI =  {
        ...config,
        paths: {
            ...paths,
            ...config.paths
        }
    }
    return doc;
}


function getPathValues(node: RouterNode, basePath = ""): PathsObject {
    let paths: PathsObject = {};
    basePath = basePath + node.basePath;
    for(let key in node.children) {
        let p = node.children[key];
        if ("children" in p) {
            Object.assign(paths, getPathValues(p, basePath));
        } else {
            let {responses, securityScheme} = (p as ExtendedRouteHandlerNode);
            
            let path: `/${string}` = p.path as `/${string}`;
            if (path[0] !== "/") {
                path = "/" + path  as `/${string}`;
            }
            //@ts-expect-error
            path = (basePath + path).replaceAll(/(\:\w+)/gi, value => {
                return `{${value.slice(1)}}`;
            });
            paths[path] ??= {};
            
            paths[path][p.method.toLowerCase() as "get"] = {
                parameters: p.params.flatMap(mapParam),
                requestBody: p.params.filter(pr => pr.type == "body").map(pr => {
                    let contentType = pr.mediatype == "form" ? "multipart/formdata" : "application/json"
                    return {
                        required: true,
                        content: {
                              [contentType]: {
                                schema: pr.schema,
                            } as MediaTypeObject
                        }
                    } as RequestBodyObject
                }).pop(),
                responses,
                security: securityScheme
            }
        }
    }
    return paths;
}


function mapParam(param: ParameterInformation): ParameterObject[] {
    let inValue: "path" | "query";
    if (param.type == "param") {
        inValue = "path";
    } else if (param.type == "query") {
        inValue = "query"
    } else {
        return [];
    }
    let schema = param.schema!;
    if (!schema || schema.type !== "object") {
        throw new Error("schema for parameter required");
    }
    let requiredProps = Object.entries(schema.properties);
    let additionalProps = Object.entries(schema.additionalProperties || {});
    let a = requiredProps.map(([name, schema]) => {
        return {
            in: inValue,
            required: true,
            name,
            schema
        }
    }).concat(additionalProps.map(([name, schema]) => {
        return {
            in: inValue,
            required: inValue == "path",
            name,
            schema
        }
    })) as ParameterObject[]
    return a;
}