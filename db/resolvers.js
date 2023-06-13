const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Provider = require("../models/Provider");
const Order = require("../models/Order");
const Report = require("../models/Report");


const bcryptjs = require('bcryptjs');
require('dotenv').config({ path: '.env'});
const jwt = require('jsonwebtoken');




const newToken = (user, secret, expiresIn) => {
    const { id, nombre, apellido, email } = user;

    return jwt.sign( {id, nombre, apellido, email}, secret, {expiresIn})
}


// RESOLVERS
const resolvers = {

    Query: {
        getUser: async (_, { }, ctx ) => {
            // const userId = await jwt.verify(token, process.env.JWT_SECRET)
            // return userId;
            return ctx.user;
        },

        // Obtener Products
        getProducts: async() =>{
            try {
                const products = await Product.find({});
                return products;
            } catch (error) {
                console.log(error)
            }
        },

        // Obtenert Product por ID
        getProduct: async(_,{ id }) =>{
            //revisar si producto existe
            const product = await Product.findById(id);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            return product;
        },

        // Obtener Clientes
        getClients: async() => {
            try {
                const clients = await Client.find({});
                return clients;
            } catch (error) {
                console.log(error)
            }
        },

        // Obtener Clientes por Promotor
        getClientsPromotor: async(_,{}, ctx) => {
            try {
                const clients = await Client.find({ promotor: ctx.user.id.toString() });
                return clients;
            } catch (error) {
                console.log(error)
            }
        },

        // Obtener Cliente por ID
        getClient: async (_, {id}, ctx) => {
            // Revisar si cliente existe
            const client = await Client.findById(id);
            if (!client) {
                throw new Error('Cliente no encontrado');
            }
            // Solo quien creo al cliente puede verlo
            if (client.promotor.toString() !== ctx.user.id) {
                throw new Error('No se visualiza por credenciales no autorizadas');
            }
            return client;
        },


        // Obtener Proveedores
        getProviders: async() => {
            try {
                const providers = await Provider.find({}).populate('promotor');
                return providers;
            } catch (error) {
                console.log(error)
            }
        },

        // Obtener Proveedor por ID
        getProvider: async (_, {id}, ctx) => {
            // Revisar si cliente existe
            const provider = await Provider.findById(id);
            if (!provider) {
                throw new Error('Proveedor No Registrado Aún');
            }
            // Solo quien creo al cliente puede verlo
            if (provider.promotor.toString() !== ctx.user.id) {
                throw new Error('No se visualiza por credenciales no autorizadas');
            }
            return provider;
        },


        // Obtener Ordenes
        getOrders: async() => {
            try {
                const orders = await Order.find({});
                return orders;
            } catch (error) {
                console.log(error)
            }
        },

        // Obtener Ordenes por Promotor
        getOrdersPromotor: async(_, {}, ctx) => {
            try {
                const orders = await Order.find({promotor: ctx.user.id}).populate('client');
                // console.log(orders);
                return orders;
            } catch (error) {
                console.log(error)
            }
        },

        // Obtener Orden por ID
        getOrder: async(_, {id}, ctx) => {
            // Revisar si orden existe
            const order = await Order.findById(id);
            if (!order) {
                throw new Error('Orden no encontrada');
            }
            // Solo quien creo la ordern puede verlo
            if (order.promotor.toString() !== ctx.user.id) {
                throw new Error('No se visualiza por credenciales no autorizadas');
            }
            return order;
        },

        // Obtener Ordenes por Estado
        getOrdersStatus: async(_,{status},ctx) => {
            const orders = await Order.find({promotor: ctx.user.id, status: status});
            return orders;
        },

        // Obtener Reportes
        getReports: async() => {
            try {
                const reports = await Report.find({}).populate('client').populate('promotor');
                return reports;
            } catch (error) {
                console.log(error)
            }
        },
    },



    Mutation: {
        // USERS (Promotores)
        newUser: async (_, { input }) => {
            const { email, password } = input;
            // Verificar si User existe
            const alreadyUser = await User.findOne({email});
            if (alreadyUser) {
                throw new Error('El Usuario ya se encuentra registrado');
            }
            // HASHEAR PASSWORD
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);
            try {
                // Save en la base de datos
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error)
            }
        },

        authUser: async (_, { input }) => {
            const { email, password } = input
            // Verificar si User existe
            const alreadyUser = await User.findOne({ email });
            if (!alreadyUser) {
                throw new Error('El Usuario no esta registrado');
            }
            // Revisar password Correcto
            const correctPassword = await bcryptjs.compare(password, alreadyUser.password);
            if(!correctPassword){
                throw new Error('El Password no es correcto');
            }
            // Crear Token
            return {
                token: newToken(alreadyUser, process.env.JWT_SECRET, '24h')
            }
        },


        // PRODUCTS
        newProduct: async (_, {input}) => {
            try {
                const product = new Product(input);
                // Almacenar en la DB
                const productSaved = await product.save();
                return productSaved;
            } catch (error) {
                console.log(error);
            }
        },

        updateProduct: async(_, {id, input}) => {
            //revisar si producto existe
            let product = await Product.findById(id);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            //guardar en DB (que Id actualizar, con que actualizar, opcion de sobreescribir)
            product = await Product.findOneAndUpdate({ _id: id}, input, { new: true });
            return product;
        },

        deleteProduct: async(_,{id}) => {
            //revisar si producto existe
            const product = await Product.findById(id);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            // Eliminar producto
            await Product.findOneAndDelete({_id : id});
            return "Producto eliminado satisfactoriamente";
        },


        // CLIENTS
        newClient: async(_,{input}, ctx) => {
            const { email } = input
            //verificar si el cliente ya registro
            const client = await Client.findOne({email});
            if (client) {
                throw new Error('Cliente ya se encuentra registrado');
            }
            //asignar el promotor
            const newClient = new Client(input);
            newClient.promotor = ctx.user.id;
            //guardar en la DB
            try {
                const clientSaved = await newClient.save();
                return clientSaved;
            } catch (error) {
                console.log(error)
            }
        },

        updateClient: async(_,{id, input}, ctx) => {
            //Verificar si existe
            let client = await Client.findById(id);
            if (!client) {
                throw new Error('El cliente no existe');
            }
            //Verificar credenciales para editar
            if (client.promotor.toString() !== ctx.user.id) {
                throw new Error('No se puede editar por credenciales no autorizadas');
            }
            //guardar en la DB
            client = await Client.findOneAndUpdate({_id: id}, input, {new: true});
            return client;
        },

        deleteClient: async (_, {id}, ctx) => {
            //Verificar si existe
            let client = await Client.findById(id);
            if (!client) {
                throw new Error('El cliente no existe');
            }
            //Verificar credenciales para eliminar
            if (client.promotor.toString() !== ctx.user.id) {
                throw new Error('No se puede eliminar por credenciales no autorizadas');
            }
            //Eliminar cliente
            await Client.findOneAndDelete({_id: id});
            return "Cliente eliminado satisfactoriamente";
        },
        

        // PROVIDERS (Proveedores) >>>
        newProvider: async(_, { input }, ctx) => {
            const { email } = input
            //verificar si el cliente ya registro
            const provider = await Provider.findOne({email});
            if (provider) {
                throw new Error('Proveedor ya se encuentra registrado');
            }
            //asignar el proveedor
            const newProvider = new Provider(input);
            newProvider.promotor = ctx.user.id;

            //guardar en la DB
            try {
                const providerSaved = await newProvider.save();
                return providerSaved;
            } catch (error) {
                console.log(error)
            }
        },

        updateProvider: async(_,{id, input}, ctx) => {
            //Verificar si existe
            let provider = await Provider.findById(id);
            if (!provider) {
                throw new Error('El Proveedor no se encuentra registrado');
            }
            //Verificar credenciales para editar
            if (provider.promotor.toString() !== ctx.user.id) {
                throw new Error('No se puede editar por credenciales no autorizadas');
            }
            //guardar en la DB
            provider = await Provider.findOneAndUpdate({_id: id}, input, {new: true});
            return provider;
        },

        deleteProvider: async (_, {id}, ctx) => {
            //Verificar si existe
            let provider = await Provider.findById(id);
            if (!provider) {
                throw new Error('El proveedor no se encuentra registrado');
            }
            //Verificar credenciales para eliminar
            if (provider.promotor.toString() !== ctx.user.id) {
                throw new Error('No se puede eliminar por credenciales no autorizadas');
            }
            //Eliminar cliente
            await Provider.findOneAndDelete({_id: id});
            return "Proveedor eliminado satisfactoriamente";
        },


        // ORDERS >>>
        newOrder: async(_,{input}, ctx) => {
            const {client} = input
            // Verificar si cliente existe
            let alreadyClient = await Client.findById(client);
            if (!alreadyClient) {
                throw new Error('El cliente no existe');
            }
            // Verificar si cliente es del promotor
            if (alreadyClient.promotor.toString() !== ctx.user.id) {
                throw new Error('No se tiene las credenciales para este proceso');
            }
            // Revisar stock disponible
            for await( const item of input.order){
                const { id } = item;
                const product = await Product.findById(id);
                if (item.cantidad > product.stock) {
                    throw new Error(`El item: ${product.nombre} excede el stock disponible`);
                }else{
                    // Restar cantidad al stock disponible
                    product.stock = product.stock - item.cantidad;
                    await product.save();
                }
            }
            // Crear Nueva Orden
            const newOrder = new Order(input);
            // Asignar un promotor
            newOrder.promotor = ctx.user.id
            // Guardar en la DB
            const orderSaved = await newOrder.save();
            return orderSaved;
        },

        updateOrder: async(_, {id, input}, ctx) => {
            const {client} = input;
            // Verificar si orden existe
            const alreadyOrder = await Order.findById(id);
            if (!alreadyOrder) {
                throw new Error('La orden no existe');
            }
            // Verificar si client existe
            const alreadyClient = await Client.findById(client);
            if (!alreadyClient) {
                throw new Error('El cliente no existe');
            }
            // Verificar si client y orden pertenecen al promotor
            if (alreadyClient.promotor.toString() !== ctx.user.id) {
                throw new Error('No se tiene las credenciales para este proceso');
            }
            // Revisar el stock
            if (input.order) {
                for await( const item of input.order){
                    const { id } = item;
                    const product = await Product.findById(id);
                    if (item.cantidad > product.stock) {
                        throw new Error(`El item: ${product.nombre} excede el stock disponible`);
                    }else{
                        // Restar cantidad al stock disponible
                        product.stock = product.stock - item.cantidad;
                        await product.save();
                    }
                }
            }
            // Guardar orden en la DB
            const orderSaved = await Order.findOneAndUpdate({_id: id}, input, {new: true});
            return orderSaved;
        },

        deleteOrder: async(_,{id},ctx) => {
            //Verificar si existe
            let order = await Order.findById(id);
            if (!order) {
                throw new Error('La orden no existe');
            }
            //Verificar credenciales para eliminar
            if (order.promotor.toString() !== ctx.user.id) {
                throw new Error('No se puede eliminar por credenciales no autorizadas');
            }
            //Eliminar cliente
            await Order.findOneAndDelete({_id: id});
            return "Orden eliminada satisfactoriamente";
        },

        // REPORTS >>>
        newReport: async(_,{input}, ctx) => {

            const {client, status, idOrders} = input
            // Verificar si cliente existe
            let alreadyClient = await Client.findById(client);
            if (!alreadyClient) {
                throw new Error('El cliente no existe');
            }
            // Verificar si cliente es del promotor
            if (status === 'PENDIENTE') {
                throw new Error('La orden debe ser ATENDIDA para generar su reporte.');
            }
            // Verificar si cliente es del promotor
            if (alreadyClient.promotor.toString() !== ctx.user.id) {
                throw new Error('No se tiene las credenciales para este proceso');
            }
            
            // Crear Nueva Reporte
            const newReport = new Report(input);
            // Asignar un promotor
            newReport.promotor = ctx.user.id
            // Guardar en la DB
            const reportSaved = await newReport.save();
            
            // Verificar si existe Orden
            let order = await Order.findById(idOrders);
            if (!order) {
                throw new Error('La orden ya no se encuentra disponible');
            }
            //Verificar credenciales para eliminar
            if (order.promotor.toString() !== ctx.user.id) {
                throw new Error('No se puede eliminar por credenciales no autorizadas');
            }
            //Eliminar cliente
            await Order.findOneAndDelete({_id: idOrders});
            // return "Orden eliminada satisfactoriamente";
            return reportSaved;
        },
    }
}

module.exports = resolvers;