# @dikur/hono
This package provides an adapter to generate a Hono router from a @dikur/http decorated class.

### Generating the router
`function HonoAdapator(target: new () => any, baseRouter: Hono, container?: Container, ajv?: Ajv): Hono`
The adapter takes a class annotated by the Http decorator and returns a Hono router.
Parameters:
- target: a class annotated by http Decorator
- baseRouter: a hono router used to attach the generated router with at the basePath route.
- container: optional parameter, a callback that takes in a class as a parameter and returns an instance of that class
    - by default it has a callback that instantiates new classes manually
    - use this to inject your DI framework of choice (e.g tsyringe: `Clz => container.resolve(Clz)`)
- ajv: optionally pass an AJV instance
    - if you would like to extend it with formats before passing it to the adapter

### Responses
unlike express where you are able to call `response.send()` without returning, decorated route handlers need to return the response object you create, the adapter will handle passing the value back to Hono's router.

```ts 
class {
@Get()
    async getUsers(@Context() ctx: Ctx) {
        await ctx.json({}) // wrong
        return ctx.json({}) // correct
    }
}
```

### @Context
Parameters decorated with the Context decorator will have Hono's Context object passed to them.

### Validation
Validation errors are raised and caught by Hono's onError handler, the exception class is
```ts
class DikurHonoValidationError extends Error {
    parametertype: string;
    errors: ErrorObject[]; // AJV's ErrorObject
    message: string;
    constructor(parametertype: string, errors: ErrorObject[]);
}
```