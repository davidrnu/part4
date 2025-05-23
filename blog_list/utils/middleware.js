const jwt = require('jsonwebtoken')
const User = require('../models/user')

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint"})
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get("authorization")
    if (authorization && authorization.startsWith("Bearer ")) {
        req.token = authorization.replace("Bearer ", "")
    } else {
        req.token = null
    }
    next()
}

const userExtractor = async (req, res, next) => {
    try {
        if (req.token) {
            const decodedToken = jwt.verify(req.token, process.env.SECRET)
            if (decodedToken.id) {
                req.user = await User.findById(decodedToken.id)
            }
        }
        next()
    } catch (error) {
        next(error)
    }
}

const errorHandler = (error, req, res, next) => {
    if (error.name === "ValidationError") {
        return res.status(400).json({error: error.message})
    }

    if (error.name === "CastError") {
        return res.status(400).json({error: error.message})
    }

    if (error.name === "MongoServerError" && error.message.includes("E11000 duplicate key error")) {
        return res.status(400).json({error: "expected `username` to be unique"})
    }

    if (error.name === "JsonWebTokenError") {
        return res.status(401).json({error: "invalid token"})
    }

    if(error.name === "TokenExpiredError") {
        return res.status(401).json({error: "token expired"})
    }

    next(error)
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}