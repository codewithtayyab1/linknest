// Strips NoSQL injection operators ($-prefixed keys, keys containing ".")
// from req.body and req.params via recursive replacement, and from
// req.query by deleting dangerous keys in-place (Express 5 makes req.query
// a read-only getter — reassigning it throws TypeError).
const UNSAFE = /^\$|\./;

const scrub = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (UNSAFE.test(key)) {
      delete obj[key];
    } else {
      scrub(obj[key]);
    }
  }
  return obj;
};

module.exports = (req, _res, next) => {
  scrub(req.body);
  scrub(req.params);
  // mutate req.query in-place instead of reassigning
  if (req.query && typeof req.query === 'object') {
    scrub(req.query);
  }
  next();
};
