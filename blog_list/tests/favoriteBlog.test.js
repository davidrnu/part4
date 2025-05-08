const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");

describe("favorite blog", () => {

    const onlyOneBlog = [
        {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12
        }
    ]

    const listOfBlogs = [
        {
            title: "React patterns",
            author: "Michael Chan",
            likes: 7
        },
        {
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            likes: 5
        },
        {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12,
        },
        {
            title: "First class tests",
            author: "Robert C. Martin",
            likes: 10
        },
        {
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            likes: 0
        }
    ]

    test("when there are no blogs is null", () => {
        const result = listHelper.favoriteBlog([])
        assert.strictEqual(result, null)
    })

    test("when there is ony one blog is that one", () => {
        const result = listHelper.favoriteBlog(onlyOneBlog)
        assert.deepStrictEqual(result, onlyOneBlog[0])
    })

    test("of a bigger list is calculated right", () => {
        const result = listHelper.favoriteBlog(listOfBlogs)
        const expected = {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12,
        }
        assert.deepStrictEqual(result, expected)
    })

})