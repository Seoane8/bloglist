const jwt = require('jsonwebtoken')
const config = require('./config')

module.exports = user => {
  const payload = {
    id: user._id,
    username: user.username
  }

  return jwt.sign(payload, config.JWT_SECRET_KEY)
}
