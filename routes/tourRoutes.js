const express = require("express");
const controller = require("../controllers/tourController");
const auth = require("../controllers/authController");
const { checkId, checkBody, aliasTopTours, getTourStats, getAllTours, createTour, getTour, updateTour, deleteTour, getMonthlyPlan } = controller;
const { authentication, authorization } = auth;
const router = express.Router();
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router.route('/tour-stats').get(getTourStats)
router.param("id", checkId);
router.route("/").get( authentication, getAllTours).post(createTour);
router.route("/:id").get(getTour).patch(updateTour).delete(authentication,authorization(['admin', 'lead-guide']) ,deleteTour);
module.exports = router;
