/**
 * asyncHandler wrapper to eliminate redundant try-catch blocks in routes.
 * It passes any errors to the global error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
