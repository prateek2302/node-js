const User = require('../Models /userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');


 exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find();
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            } 
    });
});

const filterObj = (obj, ...allowedFields) => { 
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

const signToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        const error = new CustomError('Your current password is wrong.', 401);
        return next(error);
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    // 4) Log user in, send JWT
   createSendResponse(user, 200, res);
});

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
    // 1) Create error if user POSTs password data 
    if (req.body.password || req.body.confirmPassword) {
        const error = new CustomError('This route is not for password updates. Please use /updatePassword', 400);
        return next(error);
    }

    // 2) Update user document
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    // 3) Send response
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });

    
})

exports.deleteMe = asyncErrorHandler(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
})