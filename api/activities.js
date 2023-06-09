const express = require("express");
const router = express.Router();
const {
  getAllActivities,
  createActivity,
  getActivityByName,
  updateActivity,
  getActivityById,
} = require("../db/activities");
const { getPublicRoutinesByActivity } = require("../db/routines");
const { requireUser } = require("./utils");
// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const id = req.params.activityId;

    const activities = await getPublicRoutinesByActivity({ id });
    if (!activities.length) {
      next({
        error: "activityError",
        name: "Activity",
        message: `Activity ${id} not found`,
      });
    } else {
      res.send(activities);
    }
  } catch (error) {
    next(error);
  }
});
// GET /api/activities
router.get("/", async (req, res) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const activities = await getAllActivities();

    res.send(activities);
  } catch (error) {
    throw error;
  }
});
// POST /api/activities

router.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;

  const activity = await getActivityByName(name);

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
router.patch("/:activityId", requireUser, async (req, res, next) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const activityId = req.params.activityId;
    const Activity = await getActivityById(activityId);
    if (!Activity) {
      next({
        error: "NoActivity",
        name: "ActivityError",
        message: `Activity ${activityId} not found`,
      });
    }

    const { name, description } = req.body;
    const updateFields = {};
    if (name) {
      updateFields.name = name;
    }
    if (description) {
      updateFields.description = description;
    }
    const check = await getActivityByName(name);
    if (check) {
      next({
        error: "ActivityError",
        name: "NameError",
        message: `An activity with name ${name} already exists`,
      });
    }
    const updatedActivity = await updateActivity({
      id: activityId,
      ...updateFields,
    });
    console.log(activityId);
    res.send(updatedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
