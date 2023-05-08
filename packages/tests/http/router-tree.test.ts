import { Body, Context, Http, Method, NestedRouter, Query, routerMdKey, ParameterTypes, RouterNode } from "@dikur/http";
import tap from "tap";

class User {
    static validate() {
        console.log("did the validation")
    }
}

function validateQuery() {

}

@Http("/special")
class Special {
    @Method("GET")
    async getAll() {

    }
}

@Http("/resource")
class Resource {
    @Method("GET")
    async getAll(@Context() ctx: any, @Query(validateQuery) query: any) {

    }

    @Method("POST")
    async addOne(@Context() ctx: any, @Body() data: User) {

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
                    { index: 1, type: ParameterTypes.Query, validator: validateQuery },
                ],
                path: "/getAll",
                method: "GET"
            },
            "addOne": {
                params: [
                    { index: 0, type: ParameterTypes.Context },
                    { index: 1, type: ParameterTypes.Body, validator: User.validate, reflectedType: User },
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