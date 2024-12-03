const jwt = require("jsonwebtoken");
const express = require("express");

const app = express();
const jwtSecret = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res
        .status(403)
        .send({ message: "Unauthorized Request: Token Missing" });
    }
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        // Provide specific messages for token errors
        const message =
          err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
        return res.status(403).send({ message });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

module.exports = {
  authenticateToken,
};
