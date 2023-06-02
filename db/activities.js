const client = require("./client");

// database functions
async function createActivity({ name, description }) {
  // return the new activity

  const { rows: activity } = await client.query(
    `
  INSERT INTO activities(name, description)
  VALUES($1, $2)
  RETURNING *;
  `,
    [name, description]
  );

  return activity[0];
}

async function getAllActivities() {
  // select and return an array of all activities
  const { rows: activities } = await client.query(`
  SELECT * FROM activities;`);

  const active = await Promise.all(
    activities.map((Act) => getActivityById(Act.id))
  );

  return active;
}

async function getActivityById(id) {
  const { rows: activities } = await client.query(
    ` SELECT *
    FROM activities
    WHERE id=$1`,
    [id]
  );
  return activities[0];
}

async function getActivityByName(name) {
  const { rows: activities } = await client.query(
    `
  SELECT *
  FROM activities
  WHERE name=$1;`,
    [name]
  );
  return activities[0];
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  const { rows: act } = await client.query(`
  SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
  FROM activities
  JOIN routine_activities ON routine_activities."activityId" = activities.id
  WHERE routine_activities."routineId" IN (${routines
    .map((routine) => routine.id)
    .join(", ")});`);

  const newRoutine = routines.map((routine) => {
    const trueAct = act.filter((activity) => routine.id === activity.routineId);
    routine.activities = trueAct;

    return routine;
  });
  return newRoutine;
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  if (setString.length > 0) {
    const { rows: activities } = await client.query(
      `
UPDATE activities
SET ${setString}
WHERE id=$${Object.values(fields).length + 1}
RETURNING *;`,
      [...Object.values(fields), id]
    );

    return activities[0];
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
