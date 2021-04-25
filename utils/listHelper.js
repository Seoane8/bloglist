
const totalLikes = (blogslist) => {
  return blogslist.reduce(
    (acc, { likes }) => acc + likes,
    0
  )
}

module.exports = {
  totalLikes
}
