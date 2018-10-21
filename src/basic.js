const Types = {
  bool: {
    _default: false,
  },
  number: {
    _default: 0,
  },
  string: {
    _default: '',
  },
  array: {
    _default: [],
  },
  object: {
    _default: null,
  },
}

export const MoreTypes = {
  id: {
    _default() {
      return Math.random() * 10000
    },
  },
  image: {
    file: {
      _default: null,
    },
    fakeUrl: Types.string,
    url: {
      ...Types.string,
      _format: value => value && `custom url${value}`,
    },
  },
}

export default Types
