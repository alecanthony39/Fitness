const express = require("express");
const {
  getRoutineActivityById,
  destroyRoutineActivity,
  canEditRoutineActivity,
  updateRoutineActivity,
  getRoutineById,
  destroyRoutine,
} = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineActivityById(req.params.routineActivityId);
    const routineName = await getRoutineById(routine.routineId);

    const id = req.params.routineActivityId;
    const tru = await canEditRoutineActivity(
      req.params.routineActivityId,
      req.user.id
    );

    if (!tru) {
      res.status(403);
      next({
        name: "Routine",
        error: "Routine",
        message: `User ${req.user.username} is not allowed to update ${routineName.name}`,
      });
    }
    const { count, duration } = req.body;

    const updateFields = {};

    if (count) {
      updateFields.count = count;
    }
    if (duration) {
      updateFields.duration = duration;
    }

    const updatedRoutine = await updateRoutineActivity({ id, ...updateFields });

    res.send(updatedRoutine);
  } catch (error) {
    next(error);
  }
});
// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineActivityById(req.params.routineActivityId);
    const routineName = await getRoutineById(routine.routineId);
    const tru = await canEditRoutineActivity(
      req.params.routineActivityId,
      req.user.id
    );
    console.log(tru);
    if (!tru) {
      res.status(403);
      next({
        name: "Error",
        error: "Error",
        message: `User ${req.user.username} is not allowed to delete ${routineName.name}`,
      });
    }
    const _routine = await destroyRoutineActivity(req.params.routineActivityId);

    res.send(_routine);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
