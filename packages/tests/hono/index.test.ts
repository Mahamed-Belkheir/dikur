import { HonoAdapator } from "@dikur/hono";
import { Hono, Context as HonoContext } from "hono";
import { Body, Context, Delete, Get, Http, Param, Patch, Post, Put, Query } from "@dikur/http";
import tap from "tap";


tap.test('basic route tests', async t => {

    @Http("/resource")
    class Resource {
        @Get("/item")
        async get(@Context() ctx: HonoContext) {
            return ctx.json({
                method: ctx.req.method
            })
        }
        @Post("/item")
        async post(@Context() ctx: HonoContext) {
            return ctx.json({
                method: ctx.req.method
            })
        }
        @Patch("/item")
        async patch(@Context() ctx: HonoContext) {
            return ctx.json({
                method: ctx.req.method
            })
        }
        @Put("/item")
        async put(@Context() ctx: HonoContext) {
            return ctx.json({
                method: ctx.req.method
            })
        }
        @Delete("/item")
        async delete(@Context() ctx: HonoContext) {
            return ctx.json({
                method: ctx.req.method
            })
        }
    }
    
    let app = new Hono();
    
    HonoAdapator(Resource, app);

    await t.test('GET', async t => { 
        let res = await app.request("http://localhost/resource/item");
        t.match(await res.json(), { method: "GET" })
    })

    await t.test('POST', async t => { 
        let res = await app.request("http://localhost/resource/item", { method: "POST"});
        t.match(await res.json(), { method: "POST" })
    })

    await t.test('PATCH', async t => { 
        let res = await app.request("http://localhost/resource/item", { method: "PATCH"});
        t.match(await res.json(), { method: "PATCH" })
    })

    await t.test('PUT', async t => { 
        let res = await app.request("http://localhost/resource/item", { method: "POST"});
        t.match(await res.json(), { method: "POST" })
    })

    await t.test('DELETE', async t => { 
        let res = await app.request("http://localhost/resource/item", { method: "DELETE"});
        t.match(await res.json(), { method: "DELETE" })
    })
   
})


tap.test('parameter testing', async t => {
    @Http("/resource")
    class Resource {
        @Get("/item")
        async getEnv(@Context() ctx: HonoContext) {
            return ctx.json({env: ctx.env});
        }

        @Get("/item/query")
        async getQuery(@Context() ctx: HonoContext, @Query() query: Record<string, string>) {
            console.log()
            return ctx.json({query});
        }

        @Get("/item/:param")
        async getParam(@Context() ctx: HonoContext, @Param() param: Record<string, string>) {
            return ctx.json({param});
        }

        @Post("/item")
        async postItem(@Context() ctx: HonoContext, @Body(data => {
            if (data.error) {
                throw new Error("validation failed");
            }
            return data;
        }) body: Record<string, string>) {
            return ctx.json({body});
        }

        @Post("/item/:id")
        async ordering(
            @Query() query: Record<string, string>,
            @Body() body: Record<string, string>,
            @Param() param: Record<string, string>,
            @Context() ctx: HonoContext
        ) {
            return ctx.json({
                query, body, param, env: ctx.env
            })
        }
    }

    let app = new Hono();

    app.use(async (ctx, next) => {
        ctx.env = { contextValue: "value" };
        await next();
    })

    app.onError((err, ctx) => {
        return ctx.json({
            error: err.message
        })
    })
    
    HonoAdapator(Resource, app);

    await t.test('gets context param', async t => {
        let res = await app.request("http://localhost/resource/item");
        t.match(await res.json(), { env: { contextValue: "value" } });
    })

    await t.test('gets query', async t => {
        let res = await app.request("http://localhost/resource/item/query?queryValue=value");
        t.match(await res.json(), { query: { queryValue: "value" }});
    })

    await t.test('gets param', async t => {
        let res = await app.request("http://localhost/resource/item/paramValue");
        t.match(await res.json(), { param: { param: "paramValue" } });
    })

    await t.test('posts body', async t => {
        let res = await app.request("http://localhost/resource/item", {
            method: "POST",
            body: JSON.stringify({ jsonValue: "value" }),
            headers: {
                'Content-Type': "application/json"
            }
        });
        
        t.match(await res.json(), { body: { jsonValue: "value" } });
    })

    await t.test("run validation function", async t => {
        let res = await app.request("http://localhost/resource/item", {
            method: "POST",
            body: JSON.stringify({ error: true }),
            headers: {
                'Content-Type': "application/json"
            }
        });
        
        t.match(await res.json(), { error: "validation failed" });
    })

    await t.test('orders params correctly', async t => {
        let res = await app.request("http://localhost/resource/item/100?queryValue=value", {
            method: "POST",
            body: JSON.stringify({ jsonValue: "value" }),
            headers: {
                'Content-Type': "application/json"
            }
        });
        
        t.match(await res.json(), { 
            query: { queryValue: "value" },
            param: { id: "100" },
            env: { contextValue: "value" },
            body: { jsonValue: "value" }
         });
    })
})
