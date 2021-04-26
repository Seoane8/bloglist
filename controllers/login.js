const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

const { User } = require('../models')
const { createToken } = require('../utils')

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

  const token = createToken(user)

  response.json({
    user,
    token
  })
})

module.exports = loginRouter
