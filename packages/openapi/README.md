# @dikur/openapi
This package generates an openapi 3.0 object using @dikur/http decorated classes, it requires
further annotations for some aspects that are not covered by the http decorators, including:
- Responses
- Security Schemes

## OpenAPIAdapter
`function OpenAPIAdapter(api: any, config: OpenAPI): OpenAPI`
Generates an OpenAPI object from your decorated classes, it takes two parameters,
- api: your http decorated class
- config: your open api configuration

The config follows the openapi schema definition [found here](https://swagger.io/specification/#openapi-object)
Only the `openapi` and `info` properties are required, `path` properties are auto generated, and
if using the Secured decorator, you must define your Security Schemes in `components` following [the schema](https://swagger.io/specification/#security-scheme-object).

## Response
`function Response(code: HttpCode, type: string, description = "auto generated response", schema?: Schema): MethodDecorator`
Used with route handlers to define responses on the openapi schema, it takes 4 parameters:
- code: HTTP code response, allowed values are (2-5)XX in string
- type: mediatype of response, (e.g `application/json`, `multipart/formdata`)
- description: description of response
- schema: JSON Schema of the response

Response decorators can be used multiple times to define multiple responses as long as they have different http codes.
(If you want multiple responses on the same code, use a union/anyOf in the schema)

## Secured
`function Secured(options: SecurityRequirementObject): MethodDecorator`
Used with route handlers to tell the openapi schema that a route is secured using a specific Security Scheme, the scheme must be
defined in the `components` property of the OpenAPI document passed to the OpenAPIAdapter.

It takes one parameter, SecurityRequirementObject, for more details view the [openapi docs](https://swagger.io/specification/#security-requirement-object).