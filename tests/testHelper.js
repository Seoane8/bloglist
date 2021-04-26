const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const { Blog, User } = require('../models')
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

const initialUsers = [
  {
    username: 'jgomez',
    name: 'Juan',
    password: 'jumez123'
  },
  {
    username: 'sfdez',
    name: 'Sara',
    password: 'sfer567'
  }
]

const newUser = {
  username: 'dSeoaen',
  name: 'Diego',
  password: 'pswd'
}

const addUsers = async (users = initialUsers) => {
  for (const { password, ...user } of users) {
    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = new User({ passwordHash, ...user })
    await newUser.save()
  }
}

const closeConnection = () => { mongoose.connection.close() }

module.exports = {
  api,
  initialBlogs,
  newBlog,
  initialUsers,
  newUser,
  addBlogs,
  addUsers,
  closeConnection
}
