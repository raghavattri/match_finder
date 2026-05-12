const Connection = require("../models/connection");
const { makeParticipantsKey } = require("../utils/participants");

const userSelect = "name email age gender location avatar hobbies bio lookingFor storyPrompt storyAnswer blocked";

const populateConnectionUsers = (query) =>
  query.populate("requester", userSelect).populate("recipient", userSelect);

const findBetweenUsers = (firstUserId, secondUserId) => {
  return Connection.findOne({
    participantsKey: makeParticipantsKey(firstUserId, secondUserId),
  });
};

const findById = (connectionId) => {
  return populateConnectionUsers(Connection.findById(connectionId));
};

const createConnection = (requester, recipient, status = "pending", blockedBy = null) => {
  return Connection.create({
    requester,
    recipient,
    participantsKey: makeParticipantsKey(requester, recipient),
    status,
    blockedBy,
  });
};

const getAcceptedForUser = (userId) => {
  return populateConnectionUsers(
    Connection.find({
      status: "accepted",
      $or: [{ requester: userId }, { recipient: userId }],
    }).sort({ updatedAt: -1 })
  );
};

const getPendingForUser = (userId) => {
  return populateConnectionUsers(
    Connection.find({
      status: "pending",
      recipient: userId,
    }).sort({ createdAt: -1 })
  );
};

const getBlockedByUser = (userId) => {
  return populateConnectionUsers(
    Connection.find({
      status: "blocked",
      blockedBy: userId,
    }).sort({ updatedAt: -1 })
  );
};

module.exports = {
  findBetweenUsers,
  findById,
  createConnection,
  getAcceptedForUser,
  getPendingForUser,
  getBlockedByUser,
};
