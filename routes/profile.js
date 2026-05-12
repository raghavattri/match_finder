const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/user");
const blockedMiddleware = require("../middleware/Block");
const router = express.Router();


router.get("/", authMiddleware, blockedMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ userdetails: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", authMiddleware, blockedMiddleware, async (req, res) => {
 
    try {
        // Find user by ID
        const user = await User.findById(req.user.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Update user details
        const allowedFields = [
          "name",
          "age",
          "gender",
          "hobbies",
          "location",
          "avatar",
          "bio",
          "lookingFor",
          "storyPrompt",
          "storyAnswer",
        ];

        allowedFields.forEach((field) => {
          if (req.body[field] !== undefined) {
            user[field] = req.body[field];
          }
        });
    
        // Save updated user
        await user.save();
    
        res.status(200).json({ message: 'User profile updated successfully',userdetails:user });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});



router.post("/markspam/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user._id.toString() === req.user.userId.toString()) {
      return res.status(404).json({ message: "User not found" });
    }

    user.spamReports += 1;

    if (user.spamReports >= 10) {
      user.blocked = true;
    }

    await user.save();

    res.status(200).json({ message: "User marked as spam" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
