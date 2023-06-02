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

async function getRoutineActivitiesByRoutine({ id }) {
  const { rows: routine } = await client.query(
    `
SELECT *
FROM routine_activities
WHERE "routineId"= $1`,
    [id]
  );
  return routine;
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  if (setString.length > 0) {
    const { rows: routine } = await client.query(
      `
UPDATE routine_activities
SET ${setString}
WHERE id=$${Object.values(fields).length + 1}
RETURNING *;`,
      [...Object.values(fields), id]
    );

    return routine[0];
  }
}

async function destroyRoutineActivity(id) {
  const { rows: RA } = await client.query(
    `
    DELETE FROM routine_activities
    WHERE "routineId" = $1
    RETURNING id`,
    [id]
  );

  return RA[0];
}
async function canEditRoutineActivity(routineActivityId, userId) {
  const routine = await getRoutineActivityById(routineActivityId);
  console.log("alec", routine, userId);
  if (routine.id === userId) {
    return true;
  }
  return false;
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
