const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5
    }
]

const nonExistingId = async () => {
    const blog = new Blog({
        title: "David's Blog",
        author: "David",
        url: "https://davidblog.com",
        likes: 8
    })

    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => {
        const blogObj = blog.toJSON()
        if (blogObj.user && typeof blogObj.user !== 'string') {
            blogObj.user = blogObj.user.toString()
        }
        return blogObj
    })
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs, nonExistingId, blogsInDb, usersInDb
}