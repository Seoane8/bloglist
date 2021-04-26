const { User } = require('../models')

const {
  api,
  initialUsers,
  newUser,
  ...helper
} = require('./testHelper')

beforeEach(async () => {
  await User.deleteMany({})
  await helper.addUsers()
})

describe('POST user', () => {
  test('a well formed user is created correctly', async () => {
    const { password, ...expectedUser } = newUser

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.user).toMatchObject(expectedUser)

    const numOfBlogs = await User.countDocuments()
    expect(numOfBlogs).toBe(initialUsers.length + 1)

    const savedBlog = await User.findOne({ username: newUser.username })
    expect(savedBlog).toMatchObject(expectedUser)
  })

  test('when username is already taken, return 409 and message', async () => {
    const { username } = await User.findOne()
    const password = '12345'

    const { body } = await api
      .post('/api/users')
      .send({ username, password })
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(body.error).toContain('to be unique')

    const numOfBlogs = await User.countDocuments()
    expect(numOfBlogs).toBe(initialUsers.length)
  })

  test('when username or password are not given, bad request', async () => {
    const { body: bodyPassError } = await api
      .post('/api/users')
      .send({ username: 'diego' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(bodyPassError.error).toContain('`password` is required')

    const { body: bodyUsernameErrror } = await api
      .post('/api/users')
      .send({ password: '524363' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(bodyUsernameErrror.error).toContain('`username` is required')

    const numOfBlogs = await User.countDocuments()
    expect(numOfBlogs).toBe(initialUsers.length)
  })

  test('when username or password are too shprt, bad request', async () => {
    const { body: bodyPassError } = await api
      .post('/api/users')
      .send({ username: 'diego', password: '12' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(bodyPassError.error).toMatch(/`password` is short/)

    const { body: bodyUsernameErrror } = await api
      .post('/api/users')
      .send({ username: 'di', password: '525213' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(bodyUsernameErrror.error).toMatch(/`username` \(`\w+`\) is short/)

    const numOfBlogs = await User.countDocuments()
    expect(numOfBlogs).toBe(initialUsers.length)
  })
})

afterAll(helper.closeConnection)
