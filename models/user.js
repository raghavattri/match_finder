const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  hobbies: [{ type: String }],
  location: { type: String },
  avatar: { type: String },
  bio: { type: String, trim: true, maxlength: 500, default: "" },
  lookingFor: { type: String, trim: true, maxlength: 120, default: "" },
  storyPrompt: { type: String, trim: true, maxlength: 120, default: "" },
  storyAnswer: { type: String, trim: true, maxlength: 300, default: "" },
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
