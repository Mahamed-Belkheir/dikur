import { Body, Context, Get, Http, NestedRouter, Param, Post, Query } from "@dikur/http";
import { Ctx, ExpressAdapator } from "@dikur/express";
import { Type } from "@sinclair/typebox";
import tap from "tap";
import Express from "express";
import request from "supertest";

@Http('/resource')
class ResourceController {
    @Get('/:id')
    async getResource(
        @Context() ctx: Ctx,
        @Param(Type.Object({id: Type.String()})) {id}: { id: string },
        @Query(Type.Object({query: Type.String()})) {query}: { query: string },
        ) {
            return ctx.res.json({
                id, query
            });
    }

    @Post('/:id')
    async addResource(
        @Context() ctx: Ctx,
        @Param(Type.Object({ id: Type.String() })) {id}: { id: string },
        @Query(Type.Object({ query: Type.String() })) {query}: { query: string },
        @Body(Type.Object({ name: Type.String(), genre: Type.String() })) data: { name: string, genre: string } 
        ) {
            return ctx.res.json({
                id, query, data
            });
    }
}


@Http('/api')
class Api {
    @NestedRouter()
    static resource = ResourceController
}


tap.test('can build an express api', async t => {
    let app = Express();
    app.use(Express.json());
    ExpressAdapator(Api, app);
    
    await t.test('get request', async t => {
        await request(app)
        .get('/api/resource/1?query=hello')
        .expect(res => {
            return t.match(res.body, {id: "1", query: "hello"})
        });
    })

    await t.test('post request', async t => {
        await request(app)
        .post('/api/resource/1?query=hello')
        .send({ name: "resource", genre: "api" })
        .expect(res => {
            return t.match(res.body, {id: "1", query: "hello", data: { name: "resource", genre: "api" }})
        });
    })

    
})