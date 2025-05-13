const {test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper')
const app = require('../app');
const api = supertest(app)

const Blog = require('../models/blog');

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
})

test("blogs are returned as json", async () => {
    await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/)
})

test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs")

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test("there are two blogs", async () => {
    const response = await api.get("/api/blogs")
    assert.strictEqual(response.body.length, 2)
})

test("a valid blog can be added", async () => {
    const newBlog = {
        title: "async/await simplifies making async calls",
        author: "me",
        url: "https://davidthebest.com",
        likes: 999
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(b => b.title)
    assert(contents.includes("async/await simplifies making async calls"))

})

test("blog without info is not added", async () => {
    const newBlog = { }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(400)    
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test("blog id is called properly", async () => {

    const response = await api.get("/api/blogs")
    const blog = response.body[0]
    
    assert(blog.id)
    assert(!blog._id)
})

after(async () => {
    await mongoose.connection.close()
})