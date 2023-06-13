const { gql } = require('apollo-server');


// SCHEMA
const typeDefs = gql`

    type User {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    type Token {
        token: String
    }

    type Product {
        id: ID
        nombre: String
        stock: Int
        unidad: String
        price:  Float
        creado: String
    }

    type Client {
        id: ID
        nombre: String
        apellido: String
        ruc: String
        empresa: String
        direccion: String
        distrito: String
        provincia: String
        departamento: String
        email: String
        telefono: String
        promotor: ID
    }

    type Provider {
        id: ID
        nombre: String
        apellido: String
        ruc: String
        empresa: String
        direccion: String
        distrito: String
        provincia: String
        departamento: String
        email: String
        telefono: String
        promotor: User
    }

    type Order {
        id: ID
        order: [OrderGroup]
        topay: Float
        client: Client
        promotor: ID
        creado: String
        status: StatusOrder
    }

    type OrderGroup{
        id: ID
        cantidad: Int
        nombre: String
        price: Float
        unidad: String
    }

    type Report {
        id: ID
        code: String
        order: [OrderGroup]
        topay: Float
        client: Client
        promotor: User
        creado: String
        status: StatusOrder
    }




    input UserInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }

    input ProviderInput {
        nombre: String!
        apellido: String!
        ruc: String
        empresa: String
        direccion: String
        distrito: String
        provincia: String
        departamento: String
        email: String!
        telefono: String
    }

    input ProductInput {
        nombre: String!
        stock: Int!
        unidad: String!
        price: Float!
    }

    input ClientInput {
        nombre: String!
        apellido: String!
        ruc: String
        empresa: String
        direccion: String
        distrito: String
        provincia: String
        departamento: String
        email: String!
        telefono: String
    }

    input OrderProductInput {
        id: ID
        cantidad: Int
        unidad: String
        nombre: String
        price: Float
    }
    input OrderInput {
        order: [OrderProductInput]
        topay: Float
        client: ID
        status: String
    }
    enum StatusOrder {
        PENDIENTE
        ATENDIDO
        CANCELADO
    }

    input ReportInput {
        idOrders: ID
        code: String
        order: [OrderProductInput]
        topay: Float
        client: ID
        status: String
    }




    type Query{
        #User
        getUser: User

        #Products
        getProducts: [Product]

        #Product(id)
        getProduct(id: ID!): Product

        #Clients
        getClients: [Client]
        #ClientsByPromotor
        getClientsPromotor: [Client]
        #Client(id)
        getClient(id : ID!): Client

        #Providers
        getProviders: [Provider]
        #Provider(id)
        getProvider(id: ID!): Provider

        #Orders
        getOrders: [Order]
        #OrdersByPromotor
        getOrdersPromotor: [Order]
        #Orders(id)
        getOrder(id: ID!): Order
        getOrdersStatus(status: String!) : [Order]

        #Reports
        getReports: [Report]
    }

    

    type Mutation {
        #Users
        newUser(input: UserInput) : User
        authUser(input: AuthInput): Token

        #Providers
        newProvider(input: ProviderInput) : Provider
        updateProvider(id: ID!, input: ProviderInput) : Provider
        deleteProvider(id: ID!) : String

        #Products
        newProduct(input: ProductInput) : Product
        updateProduct(id: ID!, input: ProductInput) : Product
        deleteProduct(id: ID!) : String

        #Clients
        newClient(input: ClientInput) : Client
        updateClient(id: ID!, input: ClientInput) : Client
        deleteClient(id: ID!) : String

        #Orders
        newOrder(input: OrderInput) : Order
        updateOrder(id: ID!, input: OrderInput) : Order
        deleteOrder(id: ID!) : String

        #Reports
        newReport(input: ReportInput) : Report
    }

`;

module.exports = typeDefs;