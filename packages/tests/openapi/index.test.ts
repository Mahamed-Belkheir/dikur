import { Body, Get, Http, Param, Post, Query } from "@dikur/http";
import { Static, Type } from "@sinclair/typebox";
import { OpenAPIAdapter, Response, Secured } from "../../openapi";
import tap from "tap";
import { OpenAPI } from "../../openapi/types";

const PageQuery = Type.Object({
    page: Type.Number(),
    size: Type.Number(),
})
type PageQuery = Static<typeof PageQuery>;

const PathId = Type.Object({
    id: Type.String(),
})
type PathId = Static<typeof PathId>;

const Resource = Type.Object({
    id: Type.String(),
    name: Type.String(),
})
type Resource = Static<typeof Resource>;


@Http("/resource")
export class ResourceController {

    @Response("200", "application/json", "get all resources", Type.Array(Resource))
    @Get('/')
    async getAll(@Query(PageQuery) {page, size}: PageQuery) {

    }

    @Response("200", "application/json", "get one resource", Resource)
    @Get('/:id')
    async getOne(@Param(PathId) {id}: PathId) {

    }

    @Secured({token: []})
    @Response("201", "application/json", "created successfully", Resource)
    @Post('/')
    async create(@Body(Resource, "form") data: Resource) {

    }
}


tap.test("generates valid OpenAPI schema", async t => {
    let generatedSchema = OpenAPIAdapter(ResourceController, {
        info: { title: "resource api", version: "1"},
        openapi: "3.0.0",
        components: {
            securitySchemes: {
                "token": {
                    type: "apiKey",
                    in: "header",
                    name: "authorization",
                }
            }
        }
    })

    const expectedSchema: OpenAPI = {
        info: { title: "resource api", version: "1"},
        openapi: "3.0.0",
        components: {
            securitySchemes: {
                "token": {
                    type: "apiKey",
                    in: "header",
                    name: "authorization",
                }
            }
        },
        paths: {
            "/resource/": {
                get: {
                    parameters: [
                        {
                            in: "query",
                            required: true,
                            name: "page",
                            schema: Type.Number()
                        },
                        {
                            in: "query",
                            required: true,
                            name: "size",
                            schema: Type.Number()
                        },
                    ],
                    responses: {
                        "200": {
                            description: "get all resources",
                            content: {
                                "application/json": {
                                    schema: Type.Array(Resource)
                                }
                            }
                        }
                    }
                },
                post: {
                    parameters: [],
                    requestBody: {
                        content: {
                            "multipart/formdata": {
                                schema: Resource
                            }
                        }
                    },
                    security: [{
                        token: []
                    }],
                    responses: {
                        "201": {
                            description: "created successfully",
                            content: {
                                "application/json": {
                                    schema: Resource
                                }
                            }
                        }
                    }
                }
            },
            "/resource/{id}": {
                get: {
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: Type.String(),
                        }
                    ],
                    responses: {
                        "200": {
                            description: "get one resource",
                            content: {
                                "application/json": {
                                    schema: Resource
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    t.match(generatedSchema, expectedSchema);
})