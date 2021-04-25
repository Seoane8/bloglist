const blogsRouter = require('express').Router()
const { Blog } = require('../models')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const newBlog = new Blog(request.body)

  const savedBlog = await newBlog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  const deletedBlog = await Blog.findByIdAndDelete(id)

  if (!deletedBlog) return response.status(404).end()
  response.status(204).end()
})

module.exports = blogsRouter
