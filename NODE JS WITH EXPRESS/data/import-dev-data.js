const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Movie = require('../Models /movieModel');
dotenv.config({ path: './config.env' });

//connect to mongodb
mongoose.connect(process.env.CONN_STR)
    .then(() => {
        console.log("DB connection successful");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

// read movies.json file 
const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));

const deleteMovies = async () => {
    try {
        await Movie.deleteMany();
        console.log("Movie successfully deleted!");
    } catch (err) {
        console.log("Error deleting movie");
    }
    process.exit();
};

const importMovies = async () => {
    try {
        await Movie.create(movies);
        console.log("Data successfully loaded!");
    } catch (err) {
        console.log("Error loading data");
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importMovies();
}
if (process.argv[2] === '--delete') {
    deleteMovies();
}
