const morgan = require('morgan')
const jwt = require('jsonwebtoken')

const logger = require('./logger.js')
const config = require('./config.js')

morgan.token('req-body', (request) => {
  return JSON.stringify(request.body)
})

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :req-body'
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'not found' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return error.message.includes('to be unique')
      ? response.status(409).json(
        { error: error.message.split(',')[1].trim() })
      : response.status(400).json(
        { error: error.message.split(',')[0].split(':')[2] })
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).send({ error: 'token missing or invalid' })
  }

  if (error.name === 'TokenExpirerError') {
    return response.status(401).send({ error: 'token expired' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (!authorization) return next()

  if (!authorization.toLowerCase().startsWith('bearer ')) return next()

  request.token = authorization.substring(7)
  next()
}

const payloadExtractor = (request, response, next) => {
  const token = request.token

  const decodedToken = jwt.verify(
    token,
    config.JWT_SECRET_KEY,
    { maxAge: config.JWT_EXPIRATION }
  )

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }

  request.payload = decodedToken
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  payloadExtractor
}
