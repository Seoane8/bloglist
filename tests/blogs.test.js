const { Blog, User } = require('../models')

const {
  api,
  initialBlogs,
  newBlog,
  ...helper
} = require('./testHelper')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
})

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
    const { token } = await helper.createUser()

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject(newBlog)

    const numOfBlogs = await Blog.countDocuments()
    expect(numOfBlogs).toBe(initialBlogs.length + 1)

    const savedBlog = await Blog.findOne({ title: newBlog.title })
    expect(savedBlog).toMatchObject(newBlog)
  })

  test('a well formed blog without token return unauthorized', async () => {
    await helper.addBlogs()

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('token missing')

    const numOfBlogs = await Blog.countDocuments()
    expect(numOfBlogs).toBe(initialBlogs.length)
  })

  test('a blog without likes parameter is created with 0 likes', async () => {
    const { token } = await helper.createUser()
    const { likes, ...blogToAdd } = newBlog
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogToAdd)
      .expect(201)

    const savedBlog = await Blog.findOne({ title: newBlog.title })
    expect(savedBlog.likes).toBe(0)
  })

  test('when try POST blog without title or url, return bad request', async () => {
    const { token } = await helper.createUser()
    const { title, ...blogWithoutTitle } = newBlog
    const { url, ...blogWithoutUrl } = newBlog

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutTitle)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutUrl)
      .expect(400)
  })
})

describe('DELETE blog', () => {
  test('when \'id\' is valid, delete blog', async () => {
    await helper.addBlogs()
    const { user, token } = await helper.createUser()
    const blogToDelete = await helper.createBlog(newBlog, user._id)
    const prevNumBlogs = await Blog.countDocuments()

    await api
      .delete(`/api/blogs/${blogToDelete._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const numBlogs = await Blog.countDocuments()
    expect(numBlogs).toBe(prevNumBlogs - 1)

    const blogDeletedFound = await Blog.findOne({ title: blogToDelete.title })
    expect(blogDeletedFound).toBeNull()
  })

  test('when \'id\' is invalid, bad request', async () => {
    await helper.addBlogs()
    const { token } = await helper.createUser()

    await api
      .delete('/api/blogs/1234')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const numOfBlogs = await Blog.countDocuments()
    expect(numOfBlogs).toBe(initialBlogs.length)
  })

  test('when \'id\' not exist, not found', async () => {
    const inexistentId = '60451827152dc22ad768f442'
    await helper.addBlogs()
    const { token } = await helper.createUser()

    await api
      .delete(`/api/blogs/${inexistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    const numOfBlogs = await Blog.countDocuments()
    expect(numOfBlogs).toBe(initialBlogs.length)
  })
})

describe('PUT blog', () => {
  test('when modify likes, blog is updated', async () => {
    await helper.addBlogs()

    const { id, likes, ...blog } = (await Blog.findOne()).toJSON()
    const newLikes = likes + 1
    const expectedBlog = { ...blog, id, likes: newLikes }

    const { body } = await api
      .put(`/api/blogs/${id}`)
      .send({ likes: newLikes })
      .expect(200)

    expect(body).toMatchObject(expectedBlog)

    const updatedBlog = await Blog.findOne({ _id: id })
    expect(updatedBlog).toMatchObject(expectedBlog)
  })

  test('when try to modify blog without likes, bad request', async () => {
    await helper.addBlogs()

    const { id, title } = (await Blog.findOne()).toJSON()
    const { likes, ...blog } = newBlog

    await api
      .put(`/api/blogs/${id}`)
      .send(blog)
      .expect(400)

    const updatedBlog = await Blog.findOne({ _id: id })
    expect(updatedBlog.title).toBe(title)
  })

  test('when modify blog with negative likes, bad request', async () => {
    await helper.addBlogs()

    const { id, title } = await Blog.findOne()

    await api
      .put(`/api/blogs/${id}`)
      .send({ ...newBlog, likes: -12 })
      .expect(400)

    const updatedBlog = await Blog.findOne({ _id: id })
    expect(updatedBlog.title).toBe(title)
  })

  test('when \'id\' is invalid, bad request', async () => {
    await helper.addBlogs()

    await api
      .put('/api/blogs/1234')
      .send({ likes: 12 })
      .expect(400)
  })

  test('when \'id\' not exist, not found', async () => {
    const inexistentId = '60451827152dc22ad768f442'
    await helper.addBlogs()

    await api
      .put(`/api/blogs/${inexistentId}`)
      .send({ likes: 12 })
      .expect(404)
  })
})

afterAll(helper.closeConnection)
