require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const { z, ZodError } = require("zod");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);

const patientSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  age: Number,
  password: String,
});
const patientUser = mongoose.model("patientUser", patientSchema);

const validateSchema = z.object({
  name: z.string().max(100),
  age: z.number().min(0),
  email: z.string().email(),
  mobile: z.string().length(10, "Mobile number should be 10 digits"),
  countryCode: z.string().min(1),
  password: z
    .string()
    .min(8)
    .refine(
      (val) => /[A-Z]/.test(val) && /[0-9]/.test(val) && /[@$!%*?&#]/.test(val),
      {
        message:
          "Password must include at least one uppercase letter, one number, and one special character",
      }
    ),
});

app.post("/patientSignUp", async (req, res) => {
  try {
    const validatedData = validateSchema.parse(req.body);

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
