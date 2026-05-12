const Message = require("../models/message");

const getLatestForChat = (chatId, limit = 30) => {
  return Message.find({ chat: chatId }).sort({ createdAt: -1 }).limit(limit);
};

const createMessage = ({ chat, sender, recipient, content }) => {
  return Message.create({
    chat,
    sender,
    recipient,
    content,
  });
};

module.exports = {
  getLatestForChat,
  createMessage,
};
