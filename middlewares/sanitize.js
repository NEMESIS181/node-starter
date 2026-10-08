const removeMongoOperators = (value) => {
  if (Array.isArray(value)) return value.map(removeMongoOperators);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
        .map(([key, val]) => [key, removeMongoOperators(val)]),
    );
  }
  return value;
};

const sanitize =
  ({ whitelist = [] } = {}) =>
  (req, res, next) => {
    if (req.body) req.body = removeMongoOperators(req.body);

    const query = removeMongoOperators(req.query);
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value) && !whitelist.includes(key)) query[key] = value[value.length - 1];
    });
    Object.defineProperty(req, 'query', { value: query, writable: true, enumerable: true, configurable: true });

    next();
  };

export default sanitize;
