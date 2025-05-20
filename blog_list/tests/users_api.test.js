const { describe, test, after, beforeEach } = require("node:test")
const assert = require("node:assert")
const supertest = require("supertest")
const mongoose = require("mongoose")
const helper = require("./test_helper")
const bcrypt = require("bcrypt")
const app = require("../app")
const User = require("../models/user")
const api = supertest(app)

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash("sekret", 10)
        const user = new User({ username: "root", passwordHash })

        await user.save()
    })

    test("creation succeeds with a fresh username", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "mluukkai",
            name: "Matti Luukkainen",
            password: "salainen",
        }

        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test("fails if username is taken", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salainen",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes("expected `username` to be unique"))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("fails if username missing", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: "Usuario Sin Nombre",
            password: "contraseña",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('please provide username'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("fails if password is missing", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "nopass",
            name: "nopass",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('please provide password'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("fails if username is too short", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "ab",
            name: "name",
            password: "pass",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('username must be at least 3 characters long'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("fails if pass is too showrt", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "user",
            name: "name",
            password: "12",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('password must be at least 3 characters long'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})