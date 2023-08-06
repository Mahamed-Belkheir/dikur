# @dikur/http

The http package provides decorators that map a class to a router, it consists of the following decorators:
- [Class Decorators](#class-decorators):
    - [Http](#http)
    - [Middleware](#middleware)
- [Method Decorators](#method-decorators):
    - [Get](#get--post--patch--put--delete)
    - [Post](#get--post--patch--put--delete)
    - [Patch](#get--post--patch--put--delete)
    - [Put](#get--post--patch--put--delete)
    - [Delete](#get--post--patch--put--delete)
    - [Middleware](#middleware-1)
- [Parameter Decoators](#parameter-decorators):
    - [Context](#context)
    - [Body](#body)
    - [Param](#param--query)
    - [Query](#param--query)
- [Static property decorators](#static-property-decorators):
    - [NestedRouter](#nestedrouter)

Example Usage:
```ts
@Middleware(authGuard)
@Http("/users")
class UserController {

    @Get("/")
    getUsers(@Context() ctx: Ctx, @Query(PageQuerySchema) {page, size}: PageQuerySchema) {
        let result = await users.paginate({page, size});
        return ctx.json({data: result});
    }

    @Patch("/:id")
    updateUsers(
        @Context() ctx: Ctx,
        @Param(IdParamSchema): {id}: IdParamSchema,
        @Body(UserUpdateSchema) data: UserUpdateSchema
    ) {
        await users.update(id, data);
        return ctx.json({message: "user updated successfully"})
    }
}
```

## Class Decorators

### Http
`function Http(basePath?: string): ClassDecorator`
Maps the class to a router, it takes a single parameter, basePath.
which is prefixed to all other routes defined in the class.

### Middleware
`function Middleware(handler: MiddlewareHandler | (...args: any[]) => Promise<any>): ClassOrMethodDecorator`
Registers a middleware function to the router or route, it takes any kind of function as the middleware signature
depends on the specific router implementation.
While less type safe, this allows existing router middleware libraries to be used as is.

## Method Decorators

### Get | Post | Patch | Put | Delete
`function [Get|Post|Patch|Put|Delete](path?: string): MethodDecorator`
Registers the method as a route handler on the router set by the Http decorator.
It takes a a single optional parameter, path, which if not provided, will have the method name be used instead.
```ts
class {
    @Get()
    async getUsers() {} // path is "/getUsers"
}
```
The path is passed to the router as is, so in case you which to use path parameters, use the same syntax your router uses
e.g: express: `get('/:id') // req.params: { id: string }`;

### Middleware
Identical to the class decorator, but applied to only a specific route. 
```ts
class {
    // this route does not have the middleware applied
    @Get()
    async getProducts() {}

    // but this one does
    @Middleware(authGuard)
    @Post()
    async addProduct() {}
}
```

## Parameter Decorators
Parameter decorators are used to inject values into the route handlers assigned using method decorators like Get and Post.
Aside from telling Dikur which parameters are in use and what order they are in, they can also be used for validation and documentation.   

### Context
`function Context(): ParameterDecorator`
Injects the handler context in the decorated parameter's stead, the actual value will depend on the router implementation.
Whatever the router passes to their route handlers will be included in the context object.
- For Hono it will inject the Context object.
- For Express it will inject an object containing the request, response and next parameters.

### Body
`function Body(schema?: Schema, mediatype?: "json" | "form"): ParameterDecorator`
Injects the request's body in the decorated parameter's stead, it accepts two optional parameters:
- schema: a JSON schema, used with Ajv for validating the response
- mediaType: specifies whether it's a JSON or FormData, defaults to JSON
    - no-op, adapters currently parse based on headers, but it's used by the openapi doc generator.

### Param | Query
`function [Param | Query](schema?: Schema): ParameterDecorator`
Injects the entire request's path parameter or query object in the decorated parameter's stead.
It accepts an optional schema parameter for validation.

## Static Property Decorators
### NestedRouter
`function NestedRouter(): StaticPropertyDecorator`
Registers the static property as a nested router, expects the property to be another class that was decorated using the Http decorator.