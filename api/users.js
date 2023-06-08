require("dotenv").config();
/* eslint-disable no-useless-catch */
const express = require("express");
const { createUser, getUser, getUserByUsername } = require("../db/users");
const jwt = require("jsonwebtoken");
const {
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
} = require("../db/routines");
const { requireUser } = require("./utils");
const router = express.Router();

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        error: "UserNameError",
        message: `User ${username} is already taken.`,
        name: "UserNameError",
      });
    }

    const user = await createUser({ username, password });

    if (password.length < 8) {
      next({
        error: "PasswordError",
        message: "Password Too Short!",
        name: "PasswordError",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET
    );

    res.send({
      message: "Thanks for signing up",
      token,
      user,
    });
  } catch ({ error, name, message }) {
    next({ error, name, message });
  }
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }
  try {
    const user = await getUserByUsername(username);
    if (user && user.password == password) {
      let token = jwt.sign(
        { username: user.username, password: user.password, id: user.id },
        process.env.JWT_SECRET
      );

      res.send({ message: "you're logged in!", token, user });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me
router.get("/me", requireUser, async (req, res, next) => {
  const user = await getUserByUsername(req.user.username);

  res.send(user);
});

// GET /api/users/:username/routines
router.get("/:username/routines", requireUser, async (req, res, next) => {
  const user = await getUserByUsername(req.user.username);
  if (user.id === req.user.id) {
    const routine = await getAllRoutinesByUser({ username: req.user.username });
    res.send(routine);
  } else {
    const _routines = await getPublicRoutinesByUser({
      username: req.user.username,
    });
    res.send(_routines);
  }
  // const routines = await getAllRoutinesByUser({ username: req.user.username });
  // console.log(req.authirization);
  // const pRoutines = await getPublicRoutinesByUser({
  //   username: req.user.username,
  // });

  // res.send(pRoutines);
});

module.exports = router;
