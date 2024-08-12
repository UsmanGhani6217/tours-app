const sendErrorDev = (err, res) => {
 return res.status(err.statusCode).json({
  status: err.status,
  message: err.message,
});
};
const sendErrorProd = (err, res) => {
 return res.status(err.statusCode).json({
  status: err.status,
  message: err.message,
});
};
const handleGlobalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(err, res);
  }
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
module.exports = handleGlobalError;
