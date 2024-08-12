const mongoose = require("mongoose");
const validator = require("validator");
// const User =  require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: [true, "A tour must have a name"],
      maxLength: [
        40,
        "A tour mush have less than 40 or equal to 40 characters",
      ],
      minLength: [10, "A tour mush have more than or equal to 10 characters"],
    },
    slug: String,
    duration: { type: Number, required: [true, "A tour must have a duration"] },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty should be easy, medium, and difficult",
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.7,
      min: [1, "A tour must be above 1.0"],
      max: [5, "A tour must be below 5.0"],
    },
    ratingQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, "A tour must have a price"] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to the current doc on New document creation
          return val < this.price;
        },
      },
      message: "Discount price ({VALUE}) should be less than price",
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      trim: true,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now() },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation:{
    // GeoJSON
    type:{
      type:String,
      default:'Point',
      enum:['Point']
    },
    coordinates:[Number],
    address:String,
    description:String
    },
    location:[
      {
        type:{
          type:String,
          default:'Point',
          enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
        }
    ],
    guides:[{
      type:mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// create a virtual property (run time generate property it's not a part of schema)
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//  Document Middleware: runs before .save() and .create() (not work of insertMany )
// In Document Middleware this represent the current Document (object)
tourSchema.pre("save", function (next) {
  this.slug = this.name.toLowerCase();
  next();
});
// tourSchema.pre("save", async function(next){
//   const guidesPromises = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises);
//   next()
// })
//  Query Middleware and regular expression (/^find/) for all find query
// In Query Middleware this represent the current Query (find, findOne etc...)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  console.log(`This query took ${Date.now() - this.start} milliseconds`);
  next();
});
//  Aggregate Middleware
// In Aggregate Middleware this represent the current aggregation
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
