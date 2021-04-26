const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

const { User } = require('../models')
const { config } = require('../utils')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })

  const correctLogin = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!correctLogin) {
    return response.status(401)
      .json({ error: 'invalid username or password' })
  }

  const payload = {
    id: user._id,
    username: user.username
  }

  const token = jwt.sign(payload, config.JWT_SECRET_KEY)

  response.json({
    name: user.name,
    username: user.username,
    token
  })
})

module.exports = loginRouter
