function findInArray(data, array) {
  return Array.isArray(array)
    ? array.find(d => d.id === data.id)
    : null
}

const defaults = {
  findInArray,
}

export default defaults
