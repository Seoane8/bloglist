const morgan = require('morgan')
const logger = require('./logger.js')

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
      ? response.status(409).json({ error: error.message.split(',')[1].trim() })
      : response.status(400).json(
        { error: error.message.split(',')[0].split(':')[2] })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}
