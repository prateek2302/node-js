const mongoose = require('mongoose');
const fs = require('fs');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A movie must have a name'],
        unique: true,
        maxlength: [100, 'A movie name must have less or equal than 100 characters'],
        minlength: [4, 'A movie name must have more or equal than 4 characters'],
        trim: true,
        // validate: [validator.isAlpha, "Name should only contain alphabets."]
    },
    description: {
        type: String,
        required: [true, 'A movie must have a description'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A movie must have a duration']
    },
    ratings: {
        type: Number,
        validate: {
            validator: function (v) {
                return v >= 1 && v <= 10;
            },
            message: 'Rating {{VALUE}} should be above 1 and below 10'
        }
    },
    totalRatings: {
        type: Number,
    },
    releaseYear: {
        type: Number,
        required: [true, 'A movie must have a release year']
    },
    releaseDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, 'A movie must have genres'],
        // enum: {
        //     values: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance'],
        //     message: 'Genre is not valid'
        // }
    },
    directors: {
        type: [String],
        required: [true, 'A movie must have directors']
    },
    coverImage: {
        type: String,
        required: [true, 'A movie must have a cover image']
    },
    actors: {
        type: [String],
        required: [true, 'A movie must have actors']
    },
    price: {
        type: Number,
        required: [true, 'A movie must have a price']
    },
    createdBy: {
        type: String,
        required: [true, 'A movie must have a creator']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

movieSchema.virtual('durationInHours').get(function () {
    return this.duration / 60;
});

movieSchema.pre('save', function (next) {
    this.createdBy = "PRATEEK";
    next();
});

movieSchema.post('save', function (doc, next) {
    const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}\n`;
    fs.writeFileSync('./Log/log.txt', content, { flag: 'a' }, (err) => {
        console.log(err.message);
    });
    next();
});

movieSchema.pre('/^find/', function (next) {
    this.find({ releaseDate: { $lte: Date.now() } });
    this.startTime = Date.now();
    next();
});


movieSchema.post('/^find/', function (docs, next) {
    this.find({ releaseDate: { $lte: Date.now() } });
    this.endTime = Date.now();
    const content = `Query took ${this.endTime - this.startTime} milliseconds\n`;
    fs.writeFileSync('./Log/log.txt', content, { flag: 'a' }, (err) => {
        console.log(err.message);
    });
    next();
});

movieSchema.pre('aggregate', function (next) {
    console.log(this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } }));
    next();
});


const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
