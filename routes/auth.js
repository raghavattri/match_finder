const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      hobbies: req.body.hobbies,
      location: req.body.location,
      avatar: req.body.avatar,
      bio: req.body.bio,
      lookingFor: req.body.lookingFor,
      storyPrompt: req.body.storyPrompt,
      storyAnswer: req.body.storyAnswer,
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();
    
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      "secret_key"
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        hobbies: user.hobbies,
        location: user.location,
        avatar: user.avatar,
        bio: user.bio,
        lookingFor: user.lookingFor,
        storyPrompt: user.storyPrompt,
        storyAnswer: user.storyAnswer
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    if (user.blocked) {
      return res
        .status(401)
        .json({ message: "user is blocked access to website" });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      "secret_key"
    );

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
