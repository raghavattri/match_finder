const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/user");
const blockedMiddleware = require("../middleware/Block");
const router = express.Router();

// Find a match based on hobbies
router.get("/find-match", authMiddleware,blockedMiddleware, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate matching score for each user
    const users = await User.find({
      _id: { $ne: user._id },
      gender: { $ne: user.gender },
      blocked: { $ne: true },
    });
    const matchingUsers = users.filter((otherUser) => {
      const commonHobbies = user.hobbies.filter((hobby) =>
        otherUser.hobbies.includes(hobby)
      );
      const matchingPercentage =
        (commonHobbies.length / user.hobbies.length) * 100;
      return matchingPercentage >= 70;
    });

    res.status(200).json({ matches: matchingUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept match request
router.post("/accept/:matchId", authMiddleware,blockedMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the match exists in the user's matches
    const matchIndex = user.matches.findIndex(
      (match) => match._id == req.params.matchId
    );
    if (matchIndex === -1) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Update match status to acceptedm
    user.matches[matchIndex].status = "accepted";
    await user.save();

    res.status(200).json({ message: "Match request accepted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send match request
router.post("/send/:userId", authMiddleware,blockedMiddleware, async (req, res) => {
  try {
    const sender = await User.findById(req.user.userId);
    const receiver = await User.findById(req.params.userId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }


    // Check if the receiver is already in sender's matches
    const existingMatch = sender.matches.find((match) => match.userId.toString() === req.params.userId) ;

    if (existingMatch) {
      return res.status(400).json({ message: "Match request already sent" });
    }

    // Create new match request
    sender.matches.push({
      userId: receiver._id,
      status: "pending",
    });
    await sender.save();

    res.status(200).json({ message: "Match request sent",MatchconnectionDetails:{name:receiver.name,age:receiver.age,gender:receiver.gender} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
