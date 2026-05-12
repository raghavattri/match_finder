const express = require("express");
const authMiddleware = require("../middleware/auth");
const blockedMiddleware = require("../middleware/Block");
const connectionController = require("../controllers/connectionController");

const router = express.Router();

router.use(authMiddleware, blockedMiddleware);

router.post("/request/:userId", connectionController.sendRequest);
router.post("/:connectionId/accept", connectionController.acceptRequest);
router.post("/:connectionId/reject", connectionController.rejectRequest);
router.post("/block/:userId", connectionController.blockUser);
router.post("/unblock/:userId", connectionController.unblockUser);
router.get("/accepted", connectionController.getAcceptedConnections);
router.get("/pending", connectionController.getPendingRequests);
router.get("/blocked", connectionController.getBlockedUsers);
router.post("/chat/:userId", connectionController.openChat);
router.post("/chat/:userId/messages", connectionController.sendMessage);

module.exports = router;
