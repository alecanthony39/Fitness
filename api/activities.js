const express = require("express");
const router = express.Router();
const {
  getAllActivities,
  createActivity,
  getActivityByName,
} = require("../db/activities");
const { getPublicRoutinesByActivity } = require("../db/routines");
const { requireUser } = require("./utils");
// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res) => {
  const activities = await getPublicRoutinesByActivity(req.params.activityId);

  res.send(activities);
});
// GET /api/activities
router.get("/", async (req, res) => {
  const activities = await getAllActivities();

  res.send(activities);
});
// POST /api/activities

router.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;

  const activity = await getActivityByName(name);
  console.log(activity);
  if (activity) {
    next({
      error: "Error",
      message: `An activity with name ${name} already exists`,
      name: "ActivityError",
    });
  }
  const post = await createActivity({
    name: name,
    description: description,
  });
  res.send(post);
});

// PATCH /api/activities/:activityId

module.exports = router;
