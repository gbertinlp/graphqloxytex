const mongoose = require('mongoose');
require('dotenv').config({ path: '.env'});

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO,{
            // No required in New Version of mongoose
            // useNewUrlParser: true,
            // useUnifiedTopoloy: true,
            // useFindAndModify: false,
            // useCreateIndex: true
        });
        console.log(`DB Conectada`);
    } catch (error) {
        console.log(`Error encontrado: ${error.message}`);
        process.exit(1);
    }
}

module.exports = dbConnection;