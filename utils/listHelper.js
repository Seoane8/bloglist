
const totalLikes = (blogslist) => {
  return blogslist.reduce(
    (acc, { likes }) => acc + likes,
    0
  )
}

const favoriteBlog = (blogslist) => {
  if (blogslist.length === 0) return null

  return blogslist.reduce(
    (fav, { title, author, likes }) =>
      likes > fav.likes
        ? { title, author, likes }
        : fav,
    { likes: -1 }
  )
}

module.exports = {
  totalLikes,
  favoriteBlog
}
