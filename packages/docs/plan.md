# Dikur Documentation

A collection of libraries to help you build your application using decorators.

Dikur provides decorators to build your application's entrypoints or interfaces, including HTTP APIs, CLIs, MQ etc, and by building an abstract representation, it allows building adapters for different libraries, allowing easier replacement of implementing libraries and sharing of tooling (e.g validation, documentation generation).

Status:
- Http (Beta)
    - Hono.js (Serverless Router)
    - Express.js (Plain ol' Express.js)
    - OpenAPI (Doc generation)
- CLI (Planned)
- Message Queue (Planned)
    - AMQP
    - SQS
    - Cloudflare Queue

## Http
The http library allows you to build HTTP APIs using decorators, classes can be decorated to define a router, and methods to define specific routes.

If you've used Spring, Laravel, Nest.js or Routing-Controllers the approach should be familiar.

Here's an example 

```ts
import { Http, Get, Post, Patch, Put, Context, Body } from "@dikur/http";
import { Ctx, ExpressAdapter } from "@dikur/express";
import Express from "express";
import { ResourceCreate } from "../json_schemas/resource";
import { PageQuery } from "../json_schemas/common";
import { ResourceRepository } from "../repositories/"

@Http("/resource")
export class ResourceController {
    @Get("/")
    async getResources(@Context {req, res}: Ctx, @Query(PageQuery) query: PageQuery) {
        let data = await ResourceRepository.page(query);
        return res.json({ data });
    }


    @Post("/")
    async createResource(@Context {req, res}: Ctx, @Body(ResourceCreate) data: ResourceCreate) {
        await ResourceRepository.insert(data);
        return res.status(201).json({ message: "item created successfully"});
    }
}


let app = Express();
app.use(Express.json());
ExpressAdapter(Resource, app);

app.listen("80", () => console.log("server started"));
```