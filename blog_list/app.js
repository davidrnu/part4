const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter  = require('./controllers/login');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const app = express()

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl).then((result) => {
    logger.info("connected to mongodb")
})


app.use(cors())
app.use(express.json())

app.use(middleware.tokenExtractor)
app.use("/api/blogs", middleware.userExtractor, blogsRouter)
app.use("/api/users", usersRouter)
app.use("/api/login", loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app