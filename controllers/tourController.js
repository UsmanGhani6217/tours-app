const Tour = require("../Models/tourModel");

// =============== custom Middleware ==============
exports.checkId = (req, res, next, val) => {
  if (val > 20) {
    return res.status(404).json({ status: "Fail", message: "invalid id" });
  }
  next();
};
exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(404).json({ status: "Fail", message: "invalid payload" });
  }
  next();
};
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-averageDiscount,price";
  req.query.fields = "name,price,ratingAverage";
  next();
};
exports.getAllTours = async (req, res) => {
  try {
    // Filters
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((key) => delete queryObj[key]);
    // Advance Filter like gt , lt, gte
    let queryString = JSON.stringify(queryObj);
    // replace gt, lte to $gt, $lte
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    let queryFilter = JSON.parse(queryString);
    let query = Tour.find(queryFilter);
    if (req?.query?.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    // Response fields limiting
    if (req?.query?.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }
    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * 10;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const tourCounts = await Tour.countDocuments();
      if (skip > tourCounts) throw new Error("This does not exist.");
    }

    const tours = await query;
    return res.status(200).json({
      status: "success",
      message: "fetch records successfully.",
      results: tours.length,
      data: tours,
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const tourTest = new Tour(req?.body);
    const resp = await tourTest.create();
    return res.status(201).json({
      status: "success",
      message: "New record has been created.",
      data: resp,
    });
  } catch (error) {
    res.json({ status: "fail", message: error });
  }
};
exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    return res.status(200).json({
      status: "success",
      message: `fetch record by id: ${id}`,
      data: tour,
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      returnValidator: true,
    });
    return res.status(200).json({
      status: "success",
      message: `Update record by id: ${id}`,
      data: tour,
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await Tour.findByIdAndDelete(id);
    return res.status(204).json({
      status: "success",
      message: `Record has been deleted.`,
      data: null,
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          num: { $sum: 1 },
          numRatings: { $avg: "$ratingQuantity" },
          avgRating: { $avg: "$ratingAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
      // {
      //   $match: {_id: {$ne : 'EASY'}}
      // }
    ]);
    return res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          totalTours: { $sum: 1 },
          tour: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { totalTours: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    return res.status(200).json({
      status: "success",
      results: plan.length,
      data: plan,
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
