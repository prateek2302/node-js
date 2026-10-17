const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// console.log(app.get('env'));
console.log(process.env);

mongoose.connect(process.env.CONN_STR)
    .then(() => {
        console.log("DB connection successful");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('Server has started ...');
});


process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});



