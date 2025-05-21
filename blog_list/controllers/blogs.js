const blogsRouter = require('express').Router()
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get("/", async (req, res) => {
    const blogs = await Blog.find({}).populate("user")
    res.json(blogs)
})

blogsRouter.get("/:id", async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if (blog) { res.json(blog) }
        else { res.status(404).end() }   
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.post("/", async (req, res, next) => {
    try {
        const body = req.body

        if (!req.user) {
            return res.status(401).json({ error: "token missing or invalid" })
        }

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes || 0,
            user: req.user._id
        })
        
        const savedBlog = await blog.save()
        req.user.blogs = req.user.blogs.concat(savedBlog._id)
        await req.user.save()
        res.status(201).json(savedBlog)
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.delete("/:id", async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "token missing or invalid" })
        }

        const blog = await Blog.findById(req.params.id)
        if (!blog) {
            return res.status(404).json({ error: "blog not found" })
        }

        if (blog.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "only the creator can delete this blog" })
        }

        await Blog.findByIdAndDelete(req.params.id)
        res.status(204).end()
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.put("/:id", async (req, res, next) => {
    const { title, author, url, likes } = req.body;

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, author, url, likes },
            { new: true, runValidators: true, context: 'query' }
        )

        if (updatedBlog) {
            res.json(updatedBlog);
        } else {
            res.status(404).json({ error: "blog not found" });
        }
    } catch(exception) {
        next(exception);
    }
})

module.exports = blogsRouter