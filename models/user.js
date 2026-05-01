const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  hobbies: [{ type: String }],
  location: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  matches: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }
    },
  ],
  spamReports: {
    type: Number,
    default: 0,
  },
  blocked: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
