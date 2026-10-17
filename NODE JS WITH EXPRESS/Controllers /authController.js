const User = require('../Models /userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');
const signToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendResponse(newUser, 201, res);
});

exports.login = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password are provided
    if (!email || !password) {
        const error = new CustomError('Please provide email and password!', 400);
        return next(error);
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        const error = new CustomError('Incorrect email or password', 401);
        return next(error);
    }

    // 3) If everything is ok, send token to client
    createSendResponse(user, 200, res);
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
    let token;

    // 1) Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2) Check if token is provided
    if (!token) {
        const error = new CustomError('You are not logged in! Please log in to get access.', 401);
        return next(error);
    }

    // 3) Verify token
    const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id);

    if (!user) {
        const error = new CustomError('The user belonging to this token no longer exists.', 401);
        return next(error);
    }

    if (user.changedPasswordAfter(decoded.iat)) {
        const error = new CustomError('User recently changed password! Please log in again.', 401);
        return next(error);
    }

    req.user = user;
    next();
});

exports.restrictTo = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            const error = new CustomError('You do not have permission to perform this action', 403);
            return next(error);
        }
        next();
    };
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    // 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        const error = new CustomError('There is no user with this email address.', 404);
        return next(error);
    }

    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `We have received a password reset request. Please use the below link to reset the password\n\n${resetURL}\n\nThis reset password link will be valid only for 10 minutes.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.save({ validateBeforeSave: false });

        return next(new CustomError('There was an error sending password reset email. Please try again later', 500));
    }

});

exports.passwordReset = asyncErrorHandler(async (req, res, next) => {
    // 1) Get user based on the reset token
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
        const error = new CustomError('Token is invalid or has expired', 400);
        return next(error);
    }

    // 2) Update the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    user.save();

    // 3) Log the user in
    createSendResponse(user, 200, res);

});

