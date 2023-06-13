const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const dbConnection = require('./config/db');

const cors = require('cors');
const express = require('express');

require('dotenv').config({ path: '.env'});
const jwt = require('jsonwebtoken');

// DB CONECCTION
dbConnection()


const app = express();
// const httpServer = http.createServer(app);


// SERVER
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {

        // console.log(req.headers);

        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
                // console.log('desde user index', user);
                return {
                    //CTX return >>>
                    user
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
});

// // CORS
const whitelist = ['process.env.FRONTEND_URL', 'https://api.apifacturacion.com'];

const corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.includes(origin)) {
        // Puede consultar la API
        callback(null, true);
      } else {
        // No esta permitido
        callback(new Error("Error de Cors"));
      }
    },
  };
  
app.use(cors(corsOptions));
// server.applyMiddleware({ app });
// app.use(
//     cors({ origin: ['https://api.apifacturacion.com/ruc/20558186900'] }),
// );


// START SERVER
server.listen({ port: process.env.PORT || 4000 }).then(({url}) => {
    console.log(`Servidor listo en la URL: ${url}`);
})