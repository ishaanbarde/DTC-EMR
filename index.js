require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const { z, ZodError } = require("zod");
const { patientUser } = require("./mongooseSchema");
const { authenticateToken } = require("./middleware.js");
const { validatePatientSchema, loginSchema } = require("./zodSchema");
const crypto = require("crypto");

const app = express();

app.use(express.json());

const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

mongoose.connect(mongoURI);

app.post("/patientSignUp", async (req, res) => {
  try {
    const validatedData = validatePatientSchema.parse(req.body);

    const exUser = await patientUser.findOne({ email: validatedData.email });

    if (exUser) {
      return res.status(400).send("User already exists");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto
      .createHash("sha256")
      .update(req.body.password + salt)
      .digest("hex");

    const user = new patientUser({
      name: validatedData.name,
      email: validatedData.email,
      age: validatedData.age,
      mobile: `+${validatedData.countryCode}${validatedData.mobile}`,
      password: hashedPassword,
      salt: salt,
    });

    await user.save();
    return res.status(201).send("User has been created successful");
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );

      return res.status(400).send({
        message: "Validation failed",
        errors: messages,
      });
    }
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const exUser = await patientUser.findOne({ email: email });

    if (!exUser) {
      return res.send("User does not exists!");
    } else {
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password + exUser.salt)
        .digest("hex");

      if (hashedPassword == exUser.password) {
        const token = jwt.sign(
          { id: exUser._id, email: exUser.email },
          jwtSecret,
          { expiresIn: "1h" }
        );

        return res.status(200).send({ message: "Logged IN", token: token });
      }
    }
    return res.send("Invalid email or password");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something Went Wrong!");
  }
});

app.use(authenticateToken);

app.get("/test", (req, res) => {
  return res.send("Hi there! you have access");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server Running");
});
