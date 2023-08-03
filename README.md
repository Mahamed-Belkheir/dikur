# Dikur
Dikur (Decor) is a group of libraries to build applications using decorators, currently only the http package exists. but the end goal is to be able to decorate all types of access (ports/adapters in a hexagonal architecture) to your application, including CLI and message queue events.

### @dikur/http
Similar to [routing-controllers](https://github.com/typestack/routing-controllers), allows you to decorate classes to generate routes, the difference is that the http package generates a routing tree object instead, which can then be used to generate different routers using adapters.

Currently only a [Hono](https://hono.dev/) adapter exists, but adapters for express, fastify etc are to follow, you are free to open a feature request or contribute your own adapters.

### Installing with Hono

Install the following dependencies

```bash
npm i @dikur/http @dikur/hono hono reflect-metadata
```

and in tsconfig enable:

```json
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,   
```

### Usage Example with Hono

```ts
import { Http, Get, Put, Post, Context } from "@dikur/http";
import { Hono, Context as HonoContext } from "hono";
import { HonoAdapter } from "@dikur/hono";
import { Apple, CreateAppleSchema, UpdateAppleSchema } from "./apple";
import { db } from "./db";

@Http("/apples")
class ApplesController {

    @Get("/")
    async fetchAll(@Context() ctx: HonoContext) {
        let apples = await db.apples.all();
        return ctx.json({
            status: 'success'
            data: apples
        });
    }

    @Put("/:id")
    async update(
        @Context() ctx: HonoContext,
        @Param() { id }: Record<string,string>,
        @Body(UpdateAppleSchema) apple: UpdateAppleSchema
        ) {
            await db.apples.update(apple).where({id});
            return ctx.json({ status: 'success' }, 201);
    }

    @Post("/")
    async create(
        @Context() ctx: HonoContext,
        @Body(CreateAppleSchema) apple: CreateAppleSchema
    ) {
        await db.apples.insert(apple);
        return ctx.json({ status: 'success' }, 201);
    }

    //...etc

}

const app = Hono();

HonoAdapter(ApplesController, app);

export default app;
```

# API

### @dikur/http

##### Http
A class decorator that sets a class as a router node, takes an optional basePath parameter, otherwise uses the class name as the path

This is a required decorator

##### Method decorators
- `Method(method: string, path?: string)`
A method decorator that adds the function as a route handler.

The method parameter defines the HTTP method (e.g. GET, POST, etc).
The path parameter is the routing path, it's optional, and will default to the method name (e.g `async getAll() {}` -> `/getAll`)

This is a required decorator (if you want any routes).

There also exists helper methods to avoid having to specify the HTTP methods, including:
- `Get(path?: string)`
- `Post(path?: string)`
- `Put(path?: string)`
- `Patch(path?: string)`
- `Delete(path?: string)`

##### NestedRouter
- `NestedRouter()`
A static property decorator that accepts another class that was decorated by `Http()`, nests it in using the nested classes'
base Path property.

##### Parameter decorators
Parameter decorators lets adapters know what parameters to pass to your route handler methods and in what order.

- **@Context()**
    - This passes adapter specific context to your handler, in the case of Hono it will passes Hono's Context object as is. in other adapters (e.g. fastify/express) it might group up request and response objects into one object.
- **@Body/Param/Query(schema?: JSONSchema, options?: { type: "json" | "form"}): T**
    - **Body**:
        - This passes either the formbody or json body from the request to the handler depending on content-type header
    - **Param**:
        - This passes the whole path parameter map/record object to the handler
    - **Query**:
        - This passes the whole request query map/record object to the handler

None of these parameters are required, though the Context is often needed.

### @dikur/hono

This package is the adapter for Hono's router, Hono lets you target multiple edge platforms including cloudflare workers and vercel functions, and normal node.js, deno and bun runtimes.

##### HonoAdapter
- `HonoAdapter(ClassThatWasDecorated, Hono, container?)`
Takes a class that was decorated using the `Http` decorator and a Hono router instance.
Creates a new hono instance with the classes decorated routes, attaches it to the passed Hono instance, and returns the newly created router.

It also takes an optional container parameter, a function that takes a class and returns an instance of it, by default it will be given a function that just instantiates a new instance using `new cls()`, but this lets you make use of DI containers so that your controller classes have their dependencies injected, or make use of singletons. e.g: 
```ts
HonoAdapter(ClassThatWasDecorated, Hono, (cls) => container.get(cls))

```


### @dikur/openapi