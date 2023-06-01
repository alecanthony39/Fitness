const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  const {
    rows: [user],
  } = await client.query(
    `INSERT INTO users(username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *
      `,
    [username, password]
  );
  delete user.password;
  return user;
}

async function getUser({ username, password }) {
  const { rows: user } = await client.query(
    `
  SELECT * 
  FROM users
  WHERE username=$1`,
    [username]
  );

  if (user[0].password === password) {
    delete user[0].password;
    return user[0];
  }
}

async function getUserById(userId) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: user } = await client.query(
      `SELECT * 
    FROM users
    WHERE id=${userId}`
    );
    if (!user) {
      return null;
    }
    delete user[0].password;

    return user[0];
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(userName) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: user } = await client.query(
      `SELECT *
    FROM users
    WHERE username=$1`,
      [userName]
    );

    return user[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
