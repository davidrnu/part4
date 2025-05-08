const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  return blogs.reduce((favorite, current) => {
    return current.likes > favorite.likes ? current : favorite;
  }, blogs[0]);
};

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null

    // cuantas veces aparece un autor en los blogs
    const authorCounts = {}
    blogs.forEach(blog => { // si el autor ya esta en el
                // objeto se le suma uno a su valor
                // {"robert": 2}
        if (authorCounts[blog.author]) {
            authorCounts[blog.author]++
        } else { // si el autor todavia no esta, se crea 
            // una entrada con su nombre y el numero 1
            // {"robert": 1}
            authorCounts[blog.author] = 1
        }
    })

    let maxAuthor = ""
    let maxCount = 0

    for (let author in authorCounts) { // se refiere a {"robert":}
        if (authorCounts[author] > maxCount) { // se refiere a {"robert":2}
            maxAuthor = author
            maxCount = authorCounts[author]
        }
    }

    return {
        author: maxAuthor,
        blogs: maxCount
    }
}

const mostLikes = (blogs) => {

    if (blogs.length === 0) return null

    const authorLikes = {}

    blogs.forEach(blog => {
        if (authorLikes[blog.author]) {
            authorLikes[blog.author] += blog.likes
        } else {
            authorLikes[blog.author] = blog.likes
        }
    })

    let mostLikesAuthor = ""
    let maxLikes = 0

    for (let author in authorLikes) {
        if (authorLikes[author] > maxLikes) {
            mostLikesAuthor = author
            maxLikes = authorLikes[author]
        } 
    }

    return {
        author: mostLikesAuthor,
        likes: maxLikes
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
