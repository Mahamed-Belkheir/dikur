export type OpenAPI = {
    openapi: string,
    info: InfoObject,
    servers?: ServerObject[],
    paths?: PathsObject,
    webhooks?: Record<string, PathItemObject | ReferenceObject>
    components?: ComponentsObject,
    security?: SecurityRequirementObject[]
    tags?: TagObject[],
    externalDocs?: ExternalDocumentationObject
}


export type InfoObject = {
    title: string,
    version: string,
    summary?: string,
    description?: string,
    termsOfService?: string,
    contact?: {
        name?: string,
        url?: string,
        email?: string,
    },
    license?: {
        name?: string,
        url?: string,
        identifier?: string,
    },
}

export type ServerObject = {
    url: string,
    description?: string,
    variables?: Record<string, {
        default: string,
        enum?: string[],
        description?: string,
    }>
}

export type PathsObject = Record<`/${string}`, PathItemObject>

export type WebHooks = {}

export type ComponentsObject = {
    schemas?: Record<string, SchemaObject>
    responses?: Record<string, ResponseObject>
    parameters?: Record<string, ParameterObject>,
    examples?: Record<string, ExampleObject>,
    requestBodies?: Record<string, RequestBodyObject>,
    headers?: Record<string, HeaderObject>,
    securitySchemes?: Record<string, SecuritySchemeObject>,
    links?: Record<string, LinkObject>
    callbacks?: Record<string, CallbackObject>,
    pathItems?: Record<string, PathItemObject>
}

export type SecurityRequirementObject = {
    [schemeName: string]: string[]
}

export type TagObject = {
    name: string,
    description?: string,
    externalDocs?: ExternalDocumentationObject,
}

export type ExternalDocumentationObject = {
    url: string,
    description?: string,
}

export type PathItemObject = {
    $ref?: string,
    summary?: string,
    description?: string,
    get?: OperationObject,
    post?: OperationObject,
    put?: OperationObject,
    delete?: OperationObject,
    options?: OperationObject,
    head?: OperationObject,
    patch?: OperationObject,
    trace?: OperationObject,
    servers?: ServerObject[],
    parameters?: (ParameterObject | ReferenceObject)[]
} 

export type ReferenceObject = {
    $ref: string,
    summary?: string,
    description?: string,
}


export type SchemaObject = {}

type nums = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type topNums = "1" | "2" | "3" | "4" | "5";
export type HttpCode = `${topNums}${nums}${nums}`

export type ResponsesObject = {
    [key: string]: ResponseObject,
}

export type ResponseObject = {
    default?: ResponseObject | ReferenceObject,
    headers?: Record<string, HeaderObject | ReferenceObject>,
    content?: Record<string, MediaTypeObject>,
    description: string,
    links?: Record<string, LinkObject | ReferenceObject>
}

export type ParameterObject = {
    name: string,
    description?: string,
    deprecated?: boolean,
    schema?: SchemaObject,
    examples?: Record<string, ExampleObject | ReferenceObject>,
} & ({
    in: "path",
    required: true,
} | {
    in: "query" | "header" | "cookie",
    required?: boolean
})

export type ExampleObject = {
    summary?: string,
    description?: string,
} & (
    { value?: any } |
    { externalValue?: string } 
)

export type HeaderObject = Omit<ParameterObject, "name" | "in">

export type SecuritySchemeObject = {
    description?: string,
    name: string,
} & (
    {
        type: "apiKey",
        name: string,
        in: "header" | "query" | "cookie",
    }
    |
    {   
        type: "http",
        scheme: string
    }
    | 
    {
        type: "oauth2",
        flows: {
            implicit: OAuthFlowObject,
            password: OAuthFlowObject,
            clientCredentials: OAuthFlowObject,
            authorizationCode: OAuthFlowObject,
        }
    }
    |
    {
        type: "openIdConnect",
        openIdConnectUrl: string,
    }
    |
    {
        type: "mutualTLS"
    }
)

export type OAuthFlowObject = {
    authorizationUrl?: string,
    tokenUrl?: string,
    refreshUrl?: string,
    scopes: Record<string, string>
}

export type LinkObject = {
    parameters?: Record<string, any>,
    requestBody?: any,
    description?: string,
    server?: ServerObject,
} & ({
    operationRef?: string,
} | {
    operationId?: string
})

export type CallbackObject = {
    [expression: string]: PathItemObject | ReferenceObject 
}

export type RequestBodyObject = {
    content: Record<string, MediaTypeObject>,
    description?: string,
    required?: boolean,
}

export type OperationObject = {
    tags?: string[],
    summary?: string,
    description?: string,
    externalDocs?: ExternalDocumentationObject,
    operationId?: string,
    parameters?: (ParameterObject | ReferenceObject)[],
    requestBody?: (RequestBodyObject | ReferenceObject),
    responses?: ResponsesObject,
    callbacks?: Record<string, (CallbackObject | ReferenceObject)>,
    deprecated?: false,
    security?: SecurityRequirementObject[],
    servers?: ServerObject[]
}

export type MediaTypeObject = {
    schema?: SchemaObject,
    examples?: Record<string, ExampleObject>,
    encoding?: Record<string, EncodingObject>
}

export type EncodingObject = {
    contentType?: String,
    headers?: Record<string, HeaderObject | ReferenceObject>
    style?: string,
    explode?: boolean,
    allowReserved?: boolean,
}

