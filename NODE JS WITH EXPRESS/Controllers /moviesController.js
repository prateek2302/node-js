const { param } = require('../Routes/moviesRoute');
const Movie = require('../Models /movieModel');
// const { get } = require('mongoose');
const ApiFeatures = require('../Utils/ApiFeatures');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');
exports.getHighestRatedMovies = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratings';

  next();
};

exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {

  const features = new ApiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let movies = await features.query;

  res.status(200).json({
    status: "success",
    length: movies.length,
    data: {
      movies: movies
    }
  });
});

exports.getMovie = asyncErrorHandler(async (req, res, next) => {

  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    const error = new CustomError('Movie with that ID not found', 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie: movie
    }
  });
});


exports.createMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      movie: movie
    }
  });
});

exports.updateMovie = async (req, res, next) => {

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedMovie) {
      const error = new CustomError('Movie with that ID not found', 404);
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        movie: movie
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: 'Error updating movie'
    });
  }
};



exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
  const deleteMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deleteMovie) {
    const error = new CustomError('Movie with that ID not found', 404);
    return next(error);
  }

  res.status(204).json({
    status: "success",
    data: null
  });
}
);

exports.getMovieStats = asyncErrorHandler(async (req, res, next) => {
  const stats = await Movie.aggregate([
    // {
    //   $match: { releaseDate: { $lte: new Date()}}
    // },
    {
      $match: { ratings: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: "$releaseYear",
        avgRating: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        totalPrice: { $sum: "$price" },
        movieCount: { $sum: 1 }
      }
    },
    {
      $sort: { minPrice: 1 },
    },
    // {
    //   $match: { maxPrice: { $gte: 100 } }
    // }
  ]);

  res.status(200).json({
    status: "success",
    count: stats.length,
    data: {
      stats: stats
    }
  });
}
);

exports.getMovieByGenre = asyncErrorHandler(async (req, res, next) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    {
      $unwind: '$genres'
    },
    {
      $group: {
        _id: '$genres',
        movieCount: { $sum: 1 },
        movies: { $push: '$name' },
      }
    },
    {
      $addFields: { genre: '$_id' }
    },
    {
      $project: {
        _id: 0,
      }
    },
    {
      $sort: { movieCount: -1 }
    },
    // {
    //   $limit: 5
    // }
    { $match: { genre: genre } }
  ]);
  res.status(200).json({
    status: "success",
    length: movies.length,
    data: {
      movies: movies
    }
  });
}
);
