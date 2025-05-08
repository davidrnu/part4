const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");
const { result } = require("lodash");

describe("author with most likes", () => {

    test("if blog list is empty", () => {
        const result = listHelper.mostLikes([])
        assert.strictEqual(result, null)
    })

    const onlyOneBlog = [
        {
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7
        }
    ]

    const manyBlogs = [
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
        },
        {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12
        },
        {
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html",
            likes: 10
        },
        {
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0
        }
    ]

    test("if there is only one blog", () => {
        const result = listHelper.mostLikes(onlyOneBlog)
        const expected = {
            author: "Michael Chan",
            likes: 7
        }
        assert.deepStrictEqual(result, expected)
    })

})