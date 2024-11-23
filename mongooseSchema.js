const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  age: Number,
  password: String,
  salt: String,
});

const patientUser = mongoose.model("patientUser", patientSchema);

module.exports = {
  patientUser,
};
