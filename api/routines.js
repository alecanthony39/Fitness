const express = require("express");
const router = express.Router();
const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
} = require("../db/routines");
const { requireUser } = require("./utils");
const {
  attachActivitiesToRoutines,
  addActivityToRoutine,
  getActivityById,
  getRoutineActivitiesByRoutine,
} = require("../db");

const { UnauthorizedUpdateError } = require("../errors");
// GET /api/routines
router.get("/", async (req, res) => {
  const routines = await getAllPublicRoutines();

  res.send(routines);
});
// POST /api/routines
router.post("/", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const creatorId = req.user.id;

  const routine = await createRoutine({ creatorId, isPublic, name, goal });

  res.send(routine);
});
// PATCH /api/routines/:routineId
router.patch("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);
    const id = req.params.routineId;

    if (routine.creatorId !== req.user.id) {
      res.status(403);
      next({
        name: "Routine",
        error: "Routine",
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
      });
    }
    const { isPublic, name, goal } = req.body;

    const updateFields = {};

    updateFields.isPublic = isPublic;

    if (name) {
      updateFields.name = name;
    }
    if (goal) {
      updateFields.goal = goal;
    }

    const updatedRoutine = await updateRoutine({ id, ...updateFields });

    res.send(updatedRoutine);
  } catch (error) {
    next(error);
  }
});
// DELETE /api/routines/:routineId
router.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);

    if (routine.creatorId !== req.user.id) {
      res.status(403);
      next({
        error: "userError",
        name: "User",
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
      });
    }
    const _routine = await destroyRoutine(routine.id);

    res.send(_routine);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", requireUser, async (req, res, next) => {
  try {
    // const routine = await getRoutineById(req.params.routineId);
    const { activityId, count, duration } = req.body;
    const routineId = req.params.routineId;

    const check = await getRoutineActivitiesByRoutine({ id: routineId });
    if (
      check.filter((Act) => {
        return activityId === Act.activityId;
      }).length > 0
    ) {
      next({
        error: "DuplicateError",
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
        name: "Duplicate",
      });
    }

    const AR = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });

    res.send(AR);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
