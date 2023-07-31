import { Body, Context, Http, Method, NestedRouter, Query, routerMdKey, ParameterTypes, RouterNode } from "@dikur/http";
import { Static, Type } from "@sinclair/typebox";
import tap from "tap";

const User = Type.Object({
    username: Type.String(),
    password: Type.String(),
})
type User = Static<typeof User>;

const querySchema = Type.Object({
    param: Type.String()
})

@Http("/special")
class Special {
    @Method("GET")
    async getAll() {

    }
}

@Http("/resource")
class Resource {
    @Method("GET")
    async getAll(@Context() ctx: any, @Query(querySchema) query: any) {

    }

    @Method("POST")
    async addOne(@Context() ctx: any, @Body(User) data: User) {

    }

    @NestedRouter()
    static special = Special;
}



tap.test("get router node with trees", async t => {
    let routerTree: RouterNode = {
        basePath: "/resource",
        class: Resource,
        children: {
            "getAll": {
                params: [
                    { index: 0, type: ParameterTypes.Context },
                    { index: 1, type: ParameterTypes.Query, schema: querySchema },
                ],
                path: "/getAll",
                method: "GET"
            },
            "addOne": {
                params: [
                    { index: 0, type: ParameterTypes.Context },
                    { index: 1, type: ParameterTypes.Body, schema: User },
                ],
                path: "/addOne",
                method: "POST"
            },
            "special": {
                basePath: "/special",
                class: Special,
                children: {
                    "getAll": {
                        params: [
                        ],
                        path: "/getAll",
                        method: "GET"
                    },
                }
            }
        }
    }

    t.match(Reflect.getOwnMetadata(routerMdKey, Resource), routerTree)
})

export {}