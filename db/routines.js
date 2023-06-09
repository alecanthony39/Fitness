const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");
const { getUserByUsername } = require("./users");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: routine } = await client.query(
      `INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    
    RETURNING *
    `,
      [creatorId, isPublic, name, goal]
    );

    return routine[0];
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  const {
    rows: [routine],
  } = await client.query(`
  SELECT * 
  FROM routines
  WHERE id=${id};`);
  return routine;
}

async function getRoutinesWithoutActivities() {
  const { rows: routine } = await client.query(
    `
  SELECT *
  FROM routines;
    `
  );

  return routine;
}

async function getAllRoutines() {
  const { rows: routine } = await client.query(
    `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId"
   
    
    `
  );
  await attachActivitiesToRoutines(routine);

  return routine;
}

async function getAllPublicRoutines() {
  const { rows: routine } = await client.query(
    `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = true
    
    
    `
  );
  await attachActivitiesToRoutines(routine);
  return routine.filter((routine) => routine.isPublic === true);
}

async function getAllRoutinesByUser({ username }) {
  const user = await getUserByUsername(username);

  const { rows: routine } = await client.query(
    `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "creatorId"=$1;
    
    `,
    [user.id]
  );

  await attachActivitiesToRoutines(routine);

  return routine;
}

async function getPublicRoutinesByUser({ username }) {
  const user = await getUserByUsername(username);

  const { rows: routine } = await client.query(
    `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON  routines."creatorId" = users.id 
    WHERE "creatorId"=$1 
    AND "isPublic" = true
    
    `,
    [user.id]
  );

  await attachActivitiesToRoutines(routine);

  return routine;
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows: routine } = await client.query(
    `SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    WHERE routine_activities."activityId"=$1;`,
    [id]
  );
  await attachActivitiesToRoutines(routine);

  return routine.filter((routine) => routine.isPublic === true);
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  if (setString.length > 0) {
    const { rows: routine } = await client.query(
      `
UPDATE routines
SET ${setString}
WHERE id=$${Object.values(fields).length + 1}
RETURNING *;`,
      [...Object.values(fields), id]
    );

    return routine[0];
  }
}

async function destroyRoutine(id) {
  await client.query(
    `
    DELETE FROM routine_activities
WHERE "routineId" = $1;
    `,
    [id]
  );

  const {
    rows: [routine],
  } = await client.query(
    `
    DELETE FROM routines
    WHERE id= $1
    RETURNING *
    `,
    [id]
  );

  return routine;
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
