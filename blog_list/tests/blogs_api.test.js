const { describe, test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper')
const app = require('../app');
const api = supertest(app)

const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');

describe("blogs api test", () => {
    let token;
    let userId;

    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        const savedUser = await user.save()
        userId = savedUser._id.toString()

        for (let blog of helper.initialBlogs) {
            let blogObject = new Blog({
                ...blog,
                user: savedUser._id
            })
            await blogObject.save()
        }

        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })
        
        token = loginResponse.body.token
    })

    test("blog id is named properly", async () => {
        
        const response = await api.get("/api/blogs")
        const blog = response.body[0]
        
        assert(blog.id)
        assert(!blog._id)
    })
    
    test("blog without likes is default 0", async () => {
        const blogWithNoLikes = {
            title: "no likes",
            author: "ajm",
            url: "aaaaaaaaaaaaa",
            userId: userId
        }
    
        const res = await api
            .post("/api/blogs")
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithNoLikes)
            .expect(201)
            .expect("Content-Type", /application\/json/)
        
        assert.strictEqual(res.body.likes, 0)
    })
    
    describe("when there is initially some blogs saved", () => {    
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
        
        test("a specific blog is in the returned blogs", async () => {
            const res = await api.get("/api/blogs")
    
            const titles = res.body.map(b => b.title)
            assert(titles.includes("React patterns"))
        })
    })

    describe("viewing a specific blog", () => {
        test("succeds with a valid id", async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToView = blogsAtStart[0]

            const resultBlog = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect("Content-Type", /application\/json/)
            
            assert.strictEqual(resultBlog.body.id, blogToView.id)
            assert.strictEqual(resultBlog.body.title, blogToView.title)
            assert.strictEqual(resultBlog.body.author, blogToView.author)
            assert.strictEqual(resultBlog.body.url, blogToView.url)
            assert.strictEqual(resultBlog.body.likes, blogToView.likes)
            assert(resultBlog.body.user)
        })
    
        test("fails with status 404 if id doesnt exist", async () => {
            const validNoExistingID = await helper.nonExistingId()
    
            await api
            .get(`/api/blogs/${validNoExistingID}`)
            .expect(404)
        })
        
        test("fails with status 400 if id is invalid", async () => {
            const nonValidID = "888sdh3h7d39h7d"
            
            await api
                .get(`/api/blogs/${nonValidID}`)
                .expect(400)
        })
    })

    describe("adding a new blog", () => {
        test("succeds with valid data", async () => {
            const newBlog = {
                title: "async/await simplifies making async calls",
                author: "me",
                url: "https://davidthebest.com",
                likes: 999,
                userId: userId
            }
            
            await api
                .post("/api/blogs")
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect("Content-Type", /application\/json/)
            
            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
            
            const contents = blogsAtEnd.map(b => b.title)
            assert(contents.includes("async/await simplifies making async calls"))
        })

        test("fails with status 400 if invalid data", async () => {
            const newBlog = { }
            
            await api
                .post("/api/blogs")
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)    
            
            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

        test("fails with status 401 if token is not provided", async () => {
            const newBlog = {
                title: "Blog without token",
                author: "Anonymous",
                url: "https://example.com",
                likes: 5
            }
            
            await api
                .post("/api/blogs")
                .send(newBlog)
                .expect(401)
                .expect("Content-Type", /application\/json/)
            
            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })

    describe("deletion of a blog", () => {
        test("succeds with status 204 if id is valid", async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length -1)
            
            const contents = blogsAtEnd.map(b => b.title)
            assert(!contents.includes(blogToDelete.title))
        })

        test("fails with status 401 if token is not provided", async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(401)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
        })
    })

    describe("updating blog", () => {
        test("succeeds with status 200 and updates likes", async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]
            
            const updatedData = {
                title: blogToUpdate.title,
                author: blogToUpdate.author,
                url: blogToUpdate.url,
                likes: blogToUpdate.likes + 1
            }
            
            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedData)
                .expect(200)
                .expect("Content-Type", /application\/json/)
            
            const blogsAtEnd = await helper.blogsInDb()
            const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
            
            assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
        })
        
        test("fails with status 404 if blog doesnt exist", async () => {
            const validNonExistingId = await helper.nonExistingId()
            const updatedData = {
                title: "Non-existing blog",
                author: "Unknown",
                url: "https://example.com",
                likes: 10
            }
            
            await api
                .put(`/api/blogs/${validNonExistingId}`)
                .send(updatedData)
                .expect(404)
        })
        
        test("fails with status 400 if id is invalid", async () => {
            const invalidId = "notavalidid"
            const updatedData = {
                title: "Blog with invalid ID",
                author: "Test author",
                url: "https://example.com",
                likes: 5
            }
            
            await api
                .put(`/api/blogs/${invalidId}`)
                .send(updatedData)
                .expect(400)
        })
    })
});

after(async () => {
    await mongoose.connection.close()
})