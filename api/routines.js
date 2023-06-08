const express = require("express");
const router = express.Router();
const { getAllPublicRoutines } = require("../db/routines");
// GET /api/routines
router.get("/", async (req, res) => {
  const routines = await getAllPublicRoutines();

  res.send(routines);
});
// POST /api/routines

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
