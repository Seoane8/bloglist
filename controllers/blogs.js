const blogsRouter = require('express').Router()
const { Blog } = require('../models')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const newBlog = new Blog(request.body)

  const savedBlog = await newBlog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter
