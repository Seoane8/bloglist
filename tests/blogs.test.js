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

  test('returned identifier is \'id\' instead of \'_id\'', async () => {
    await helper.addBlogs()

    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
    expect(response.body[0]._id).toBeUndefined()
  })
})

describe('POST blog', () => {
  test('a well formed blog is created correctly', async () => {
    await helper.addBlogs()

    const newBlog = {
      title: 'SuperBlog by John Doe',
      author: 'John Doe',
      url: 'http://www.superblog.com',
      likes: 1
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject(newBlog)

    const numOfBlogs = await helper.countBlogs()
    expect(numOfBlogs).toBe(initialBlogs.length + 1)

    const savedBlog = await helper.findBlog({ title: newBlog.title })
    expect(savedBlog).toMatchObject(newBlog)
  })
})

afterAll(helper.closeConnection)
