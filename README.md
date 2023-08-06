# Dikur
Dikur (Decor) is a group of libraries to build applications using decorators, currently only the http package exists. but the end goal is to be able to decorate all types of access (ports/adapters in a hexagonal architecture) to your application, including CLI and message queue events.

### @dikur/http
Similar to [routing-controllers](https://github.com/typestack/routing-controllers), allows you to decorate classes to generate routers, the difference is that dikur's http package generates an abstract routing tree object instead, which can then be used to generate different routers using adapters.

This allows you to target different js platforms, for example what Hono supports includes:
- AWS lambda
- Vercel Functions
- Deno
- Bun
- Fastly
and other platforms found on the [official docs](https://hono.dev/), and it's also possible to build your own adapter
to whatever routing library you prefer (it only takes around 80-100 LoC)

You can find the documentation [here](./packages/http/)

current adapters and their documentation:
- [Hono](./packages/hono/README.md)
- [Express](./packages/express/README.md)
- [OpenAPI](./packages/openapi/README.md)

Some example usage can be found in the [tests](./packages/tests).
