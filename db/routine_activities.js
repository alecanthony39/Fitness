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
    ON CONFLICT ("routineId", "activityId") DO NOTHING
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
  try {
    const { rows } = await client.query(
      `DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *;
      `,
      [id]
    );

    const [routineActivity] = rows;
    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}
async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows } = await client.query(
      `
      SELECT routines."creatorId"
      FROM routines
      JOIN routine_activities ON routine_activities."routineId" = routines.id
      WHERE routine_activities.id=$1;
      `,
      [routineActivityId]
    );

    const [routineActivity] = rows;
    if (routineActivity.creatorId === userId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
