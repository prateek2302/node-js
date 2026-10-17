// const {application} = require('express');
const express = require('express');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
// const sanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const moviesRouter = require('./Routes/moviesRoute');
const authRouter = require('./Routes/authRouter');
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers /errorController');
const userRoute = require('./Routes/userRoute');
let app = express();


// app.use(helmet());
// let limiter = rateLimit({
//   max: 1000,
//   windowMs: 60 * 60 * 1000,
//   message: 'We have received too many requests from this IP. Please try after one hour.'
// });

// app.use('/api', limiter);
// const logger = function(req, res, next) {
//   console.log('Custom middleware called');
//   next();
// };

app.use(express.json({ limit: '10kb' }));

// app.use(sanitize());

// app.use(xss());
// app.use(morgan('dev'));
app.use(express.static('./public'));
// app.use(logger);
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

//USING ROUTES

app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRoute);
app.all('/*splat', (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on the server!`
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on the server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
  next(err);
});

console.log("Hello from the app.js file...");

app.use(globalErrorHandler);

module.exports = app;