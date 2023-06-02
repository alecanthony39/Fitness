const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: aR } = await client.query(
      `
    INSERT INTO routine_activities("routineId", "activityId", count, duration)
    VALUES($1, $2, $3, $4)
    
    RETURNING *
    `,
      [routineId, activityId, count, duration]
    );

    return aR[0];
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivityById(id) {
  const { rows: routine } = await client.query(
    `SELECT *
  FROM routine_activities
  WHERE id=${id}
  `
  );

  return routine[0];
}

async function getRoutineActivitiesByRoutine({ id }) {}

async function updateRoutineActivity({ id, ...fields }) {}

async function destroyRoutineActivity(id) {}

async function canEditRoutineActivity(routineActivityId, userId) {}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
