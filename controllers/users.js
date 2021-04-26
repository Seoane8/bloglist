const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const { User } = require('../models')
const { createToken } = require('../utils')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { user: 0 })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { password, ...user } = request.body

  if (!password) {
    return response
      .status(400)
      .json({ error: 'Path `password` is required.' })
  }

  if (password.length < 3) {
    return response
      .status(400)
      .json({
        error: 'Path `password` is shorter than the minimum allowed length (3).'
      })
  }
  const passwordHash = await bcrypt.hash(password, 10)

  const newUser = new User({ passwordHash, ...user })

  const savedUser = await newUser.save()

  const token = createToken(savedUser)
  response.status(201).json({ user: savedUser, token })
})

module.exports = usersRouter
