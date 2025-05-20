const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (req, res, next) => {
    const users = await User.find({}).populate("blogs")
    res.json(users)
})

usersRouter.post('/', async (req, res, next) => {
    try {
        const { username, name, password } = req.body;
        if (!username) {
            return res.status(400).json({ 
                error: 'please provide username' 
            });
        }
        if (!password) {
            return res.status(400).json({ 
                error: 'please provide password' 
            });
        }

        if (username.length < 3) {
            return res.status(400).json({ 
                error: 'username must be at least 3 characters long' 
            });
        }

        if (password.length < 3) {
            return res.status(400).json({ 
                error: 'password must be at least 3 characters long' 
            });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        const user = new User({
            username, 
            name,
            passwordHash
        });
        
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch(error) {
        next(error);
    }
})

module.exports = usersRouter;