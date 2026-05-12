const connectionService = require("../services/connectionService");

const handleError = (res, error) => {
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
  });
};

const sendRequest = async (req, res) => {
  try {
    const result = await connectionService.sendConnectionRequest(req.user.userId, req.params.userId);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const acceptRequest = async (req, res) => {
  try {
    const result = await connectionService.acceptRequest(req.user.userId, req.params.connectionId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const rejectRequest = async (req, res) => {
  try {
    const result = await connectionService.rejectRequest(req.user.userId, req.params.connectionId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const blockUser = async (req, res) => {
  try {
    const result = await connectionService.blockUser(req.user.userId, req.params.userId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const unblockUser = async (req, res) => {
  try {
    const result = await connectionService.unblockUser(req.user.userId, req.params.userId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const getAcceptedConnections = async (req, res) => {
  try {
    const connections = await connectionService.getAcceptedConnections(req.user.userId);
    res.status(200).json({ connections });
  } catch (error) {
    handleError(res, error);
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await connectionService.getPendingRequests(req.user.userId);
    res.status(200).json({ requests });
  } catch (error) {
    handleError(res, error);
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await connectionService.getBlockedUsers(req.user.userId);
    res.status(200).json({ blockedUsers });
  } catch (error) {
    handleError(res, error);
  }
};

const openChat = async (req, res) => {
  try {
    const chat = await connectionService.getOrCreateChat(req.user.userId, req.params.userId);
    res.status(chat.wasCreated ? 201 : 200).json({ chat });
  } catch (error) {
    handleError(res, error);
  }
};

const sendMessage = async (req, res) => {
  try {
    const result = await connectionService.sendMessage(
      req.user.userId,
      req.params.userId,
      req.body.content
    );
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  blockUser,
  unblockUser,
  getAcceptedConnections,
  getPendingRequests,
  getBlockedUsers,
  openChat,
  sendMessage,
};
