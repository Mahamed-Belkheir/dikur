# @dikur/express
This package provides an adapter to generate an express router from a @dikur/http decorated class.

### Generating the router
`function ExpressAdapator(target: new () => any, baseRouter: Router, container?: Container, ajv?: Ajv): Router`
The adapter takes a class annotated by the Http decorator and returns a Express router.
Parameters:
- target: a class annotated by http Decorator
- baseRouter: an express router used to attach the generated router at the class's basePath.
- container: optional parameter, a callback that takes in a class as a parameter and returns an instance of that class
    - by default it has a callback that instantiates new classes manually
    - use this to inject your DI framework of choice (e.g tsyringe: `Clz => container.resolve(Clz)`)
- ajv: optionally pass an AJV instance
    - if you would like to extend it with formats before passing it to the adapter

### @Context
Parameters decorated with the Context decorator will have express's 3 route handler parameters passed in an Object.
```ts
type Ctx = {
    req: Request,
    res: Response,
    next: NextFunction
}
```
### Responses
Use express's response object to send responses, other functionality (setting/getting headers etc), is also
done normally as with express route handlers.

```ts 
class {
@Get()
    async getUsers(@Context() ctx: Ctx) {
        ctx.res.json({})
    }
}
```

### Validation
Validation errors are raised and caught by the adapter, and passed to express's error handler using `next(e)`, you do not need to wrap your route handlers in try catch blocks.

```ts
class DikurExpressValidationError extends Error {
    parametertype: string;
    errors: ErrorObject[]; // AJV's ErrorObject
    message: string;
    constructor(parametertype: string, errors: ErrorObject[]);
}
```