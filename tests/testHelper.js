const mongoose = require('mongoose')
const supertest = require('supertest')

const { Blog } = require('../models')
const app = require('../app.js')

const api = supertest(app)

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const newBlog = {
  title: 'SuperBlog by John Doe',
  author: 'John Doe',
  url: 'http://www.superblog.com',
  likes: 1
}

const addBlogs = async (bloglist = initialBlogs) => {
  const blogObjets = bloglist.map(blog => new Blog(blog))
  const promises = blogObjets.map(blogObjet => blogObjet.save())
  await Promise.all(promises)
}

const findBlog = async params => await Blog.findOne(params)

const countBlogs = async () => await Blog.countDocuments()

const closeConnection = () => { mongoose.connection.close() }

module.exports = {
  api,
  initialBlogs,
  newBlog,
  addBlogs,
  findBlog,
  countBlogs,
  closeConnection
}
