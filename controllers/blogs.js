const blogsRouter = require('express').Router()
const { Blog } = require('../models')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', (request, response, next) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => response.status(201).json(result))
    .catch(next)
})

module.exports = blogsRouter
