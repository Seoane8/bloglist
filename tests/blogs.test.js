const { Blog } = require('../models')

const {
  api,
  initialBlogs,
  ...helper
} = require('./testHelper')

beforeEach(async () => await Blog.deleteMany({}))

describe('GET all blogs', () => {
  test('when there are NO blogs, return empty JSON array', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(0)
  })

  test('when there are blogs, return the correct number of them in JSON', async () => {
    await helper.addBlogs()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(initialBlogs.length)
  })
})

afterAll(helper.closeConnection)
