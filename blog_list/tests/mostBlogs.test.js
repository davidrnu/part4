const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');

describe("most blogs", () => {

    test("if there are no blogs is null", () => {
        const result = listHelper.mostBlogs([])
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
        const result = listHelper.mostBlogs(onlyOneBlog)
        const expected = {
            author: "Michael Chan",
            blogs: 1
        }
        assert.deepStrictEqual(result, expected)
    })

    test("of many blogs", () => {
        const result = listHelper.mostBlogs(manyBlogs)
        const expected = {
            author: "Edsger W. Dijkstra",
            blogs: 2
        }
        assert.deepStrictEqual(result, expected)
    })
})