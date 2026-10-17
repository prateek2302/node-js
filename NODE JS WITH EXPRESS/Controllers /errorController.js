const CustomError = require('../Utils/CustomError');

const devErrors = (res, err) => {
    res.status(err.statusCode).json({
        status: "error",
        message: err.message,
        stackTrace: err.stack,
        error: err
    });
}

const castErrorHandler = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new CustomError(message, 400);
}

const duplicateKeyErrorHandler = (err) => {
    const name = err.keyValue.name;
    const message = `Duplicate field value: ${name}. Please use another value!`;
    return new CustomError(message, 400);
}

const validationErrorHandler = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const errorMessages = errors.join('. ');
    const msg = `Invalid input data: ${errorMessages}`;
    return new CustomError(msg, 400);
}

const handlerExpiredJWT = (err) => {
    return new CustomError('Your token has expired! Please log in again.', 401);
}

const handleJWTError = (err) => {
    return new CustomError('Invalid token! Please log in again.', 401);
}

const prodErrors = (res, err) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message
        });
    } else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong! Please try again later."
        });
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        devErrors(res, err);
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') err = castErrorHandler(err);
        if (err.code === 11000) err = duplicateKeyErrorHandler(err);
        if (err.name === 'ValidationError') err = validationErrorHandler(err);
        if (err.name === 'TokenExpiredError') err = handlerExpiredJWT(err);
        if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    }
}