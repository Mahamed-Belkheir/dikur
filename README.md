# Dikur
Dikur (Decor) is a group of libraries to build applications using decorators, currently only the http package exists. but the end goal is to be able to decorate all types of access (ports/adapters in a hexagonal architecture) to your application, including CLI and message queue events.

### @dikur/http
Similar to [routing-controllers](https://github.com/typestack/routing-controllers), allows you to decorate classes to generate routers, the difference is that dikur's http package generates an abstract routing tree object instead, which can then be used to generate different routers using adapters.

current adapters:
- [Hono](./packages/hono/README.md)
- [Express](./packages/express/README.md)
- [OpenAPI](./packages/openapi/README.md)
