const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { uploadImage } = require("../middleware/upload");
const { cloudinary, assertCloudinaryConfig } = require("../config/cloudinary");

const router = express.Router();

const parseHobbies = (hobbies) => {
  if (Array.isArray(hobbies)) return hobbies;
  if (typeof hobbies !== "string") return [];

  try {
    const parsed = JSON.parse(hobbies);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return hobbies.split(",").map((hobby) => hobby.trim()).filter(Boolean);
  }
};

const uploadAvatar = async (file, email) => {
  if (!file) return undefined;

  assertCloudinaryConfig();

  const safeEmail = String(email || "new-user").replace(/[^a-zA-Z0-9_-]/g, "-");

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "matchfinder/profile-photos",
        resource_type: "image",
        public_id: `register-${safeEmail}-${Date.now()}`,
        transformation: [
          { width: 600, height: 600, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });

  return uploadResult.secure_url;
};

router.post("/register", uploadImage.single("avatar"), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const avatarUrl = req.file ? await uploadAvatar(req.file, req.body.email) : req.body.avatar;

    const user = new User({
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      hobbies: parseHobbies(req.body.hobbies),
      location: req.body.location,
      avatar: avatarUrl,
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
