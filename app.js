const express = require("express");
const hpp = require("hpp");
const morgan = require("morgan");
const xss = require("xss-clean");
const helmet = require("helmet");
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const handleGlobalError = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");


const app = express();
// 1) ======================= Global Middleware =======================
// set security for http header
app.use(helmet());

// logging for the development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// set the limit request from same IP
const limiter = rateLimit({
  max:100,
  windowMs: 60 * 60 * 1000,
  message:'Too many requests from this IP. please try again after an hour'
});
app.use('/api', limiter);
// use express middleware to convert the request body into the Json(middleware is a function that can change the data of request it happen mid of request and response)
app.use(express.json({limit: '10kb'}));

// Data sanitize against the NoSQL query injection 
app.use(mongoSanitize());

// Data sanitize against the xss
app.use(xss());

// prevent the parameter pollution
app.use(hpp({
  whitelist:[
    'duration',
    'ratingQuantity',
    'ratingAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

//serving the static file from the server
app.use(express.static(`${__dirname}/public`));


//2) custom middleware to add request time to the each request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get("/", (req, res) => {
  res.status(200).send("Hello from the server side");
});

// ======================= Routes =======================
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);


// routes error handling
app.all('*', (req, res, next ) => {
  const err = new Error(`Can't find this ${req.originalUrl} on the server`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

app.use(handleGlobalError)


module.exports = app;
