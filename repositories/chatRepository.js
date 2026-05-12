const Chat = require("../models/chat");
const { makeParticipantsKey } = require("../utils/participants");

const populateChat = (query) =>
  query
    .populate("participants", "name email age gender location avatar")
    .populate("latestMessage");

const findBetweenUsers = (firstUserId, secondUserId) => {
  return populateChat(
    Chat.findOne({
      participantsKey: makeParticipantsKey(firstUserId, secondUserId),
    })
  );
};

const createChat = (firstUserId, secondUserId) => {
  return Chat.create({
    participants: [firstUserId, secondUserId],
    participantsKey: makeParticipantsKey(firstUserId, secondUserId),
    unreadCounts: [
      { userId: firstUserId, count: 0 },
      { userId: secondUserId, count: 0 },
    ],
  });
};

const findById = (chatId) => {
  return populateChat(Chat.findById(chatId));
};

const markReadForUser = async (chatId, userId) => {
  await Chat.updateOne(
    { _id: chatId, "unreadCounts.userId": userId },
    { $set: { "unreadCounts.$.count": 0 } }
  );
  return findById(chatId);
};

const applyNewMessage = async (chatId, messageId, recipientId) => {
  await Chat.updateOne(
    { _id: chatId, "unreadCounts.userId": recipientId },
    {
      $set: { latestMessage: messageId },
      $inc: { "unreadCounts.$.count": 1 },
    }
  );
  return findById(chatId);
};

module.exports = {
  findBetweenUsers,
  createChat,
  findById,
  markReadForUser,
  applyNewMessage,
};
