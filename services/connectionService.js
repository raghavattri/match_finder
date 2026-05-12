const User = require("../models/user");
const connectionRepository = require("../repositories/connectionRepository");
const chatRepository = require("../repositories/chatRepository");
const messageRepository = require("../repositories/messageRepository");
const { isValidObjectId } = require("../utils/participants");

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const assertTargetUser = async (currentUserId, targetUserId) => {
  if (!isValidObjectId(targetUserId)) {
    throw createHttpError(400, "Invalid user id");
  }

  if (currentUserId.toString() === targetUserId.toString()) {
    throw createHttpError(400, "You cannot perform this action on yourself");
  }

  const user = await User.findById(targetUserId).select("name email age gender location avatar hobbies bio lookingFor storyPrompt storyAnswer blocked");
  if (!user || user.blocked) {
    throw createHttpError(404, "User not found");
  }

  return user;
};

const getOtherUser = (connection, currentUserId) => {
  const current = currentUserId.toString();
  return connection.requester._id.toString() === current
    ? connection.recipient
    : connection.requester;
};

const getUnreadCount = (chat, currentUserId) => {
  const unread = chat.unreadCounts?.find(
    (entry) => entry.userId.toString() === currentUserId.toString()
  );
  return unread?.count || 0;
};

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.email?.split("@")[0] || user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  location: user.location,
  avatar: user.avatar,
  hobbies: user.hobbies || [],
  bio: user.bio || "",
  lookingFor: user.lookingFor || "",
  storyPrompt: user.storyPrompt || "",
  storyAnswer: user.storyAnswer || "",
  isOnline: false,
});

const serializeConnection = async (connection, currentUserId) => {
  const otherUser = getOtherUser(connection, currentUserId);
  const chat = connection.status === "accepted"
    ? await chatRepository.findBetweenUsers(currentUserId, otherUser._id)
    : null;

  return {
    _id: connection._id,
    status: connection.status,
    requesterId: connection.requester._id,
    recipientId: connection.recipient._id,
    user: serializeUser(otherUser),
    chat: chat
      ? {
          _id: chat._id,
          unreadCount: getUnreadCount(chat, currentUserId),
          latestMessage: chat.latestMessage || null,
        }
      : null,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
  };
};

const sendConnectionRequest = async (currentUserId, targetUserId) => {
  await assertTargetUser(currentUserId, targetUserId);

  const existing = await connectionRepository.findBetweenUsers(currentUserId, targetUserId);
  if (existing) {
    if (existing.status === "rejected") {
      existing.requester = currentUserId;
      existing.recipient = targetUserId;
      existing.status = "pending";
      existing.blockedBy = null;
      await existing.save();
      return { message: "Connection request sent", connection: existing };
    }

    throw createHttpError(409, `Connection already ${existing.status}`);
  }

  const connection = await connectionRepository.createConnection(currentUserId, targetUserId);
  return { message: "Connection request sent", connection };
};

const acceptRequest = async (currentUserId, connectionId) => {
  if (!isValidObjectId(connectionId)) {
    throw createHttpError(400, "Invalid connection id");
  }

  const connection = await connectionRepository.findById(connectionId);
  if (!connection) {
    throw createHttpError(404, "Connection request not found");
  }

  if (connection.recipient._id.toString() !== currentUserId.toString()) {
    throw createHttpError(403, "Only the recipient can accept this request");
  }

  if (connection.status !== "pending") {
    throw createHttpError(409, `Connection is already ${connection.status}`);
  }

  connection.status = "accepted";
  connection.blockedBy = null;
  await connection.save();

  const chat = await getOrCreateChat(currentUserId, connection.requester._id);
  return { message: "Connection request accepted", connection, chat };
};

const rejectRequest = async (currentUserId, connectionId) => {
  if (!isValidObjectId(connectionId)) {
    throw createHttpError(400, "Invalid connection id");
  }

  const connection = await connectionRepository.findById(connectionId);
  if (!connection) {
    throw createHttpError(404, "Connection request not found");
  }

  if (connection.recipient._id.toString() !== currentUserId.toString()) {
    throw createHttpError(403, "Only the recipient can reject this request");
  }

  if (connection.status !== "pending") {
    throw createHttpError(409, `Connection is already ${connection.status}`);
  }

  connection.status = "rejected";
  await connection.save();
  return { message: "Connection request rejected", connection };
};

const blockUser = async (currentUserId, targetUserId) => {
  await assertTargetUser(currentUserId, targetUserId);

  let connection = await connectionRepository.findBetweenUsers(currentUserId, targetUserId);
  if (!connection) {
    connection = await connectionRepository.createConnection(
      currentUserId,
      targetUserId,
      "blocked",
      currentUserId
    );
    return { message: "User blocked", connection };
  }

  connection.status = "blocked";
  connection.blockedBy = currentUserId;
  await connection.save();
  return { message: "User blocked", connection };
};

const unblockUser = async (currentUserId, targetUserId) => {
  if (!isValidObjectId(targetUserId)) {
    throw createHttpError(400, "Invalid user id");
  }

  const connection = await connectionRepository.findBetweenUsers(currentUserId, targetUserId);
  if (!connection || connection.status !== "blocked") {
    throw createHttpError(404, "Blocked user not found");
  }

  if (connection.blockedBy?.toString() !== currentUserId.toString()) {
    throw createHttpError(403, "You can only unblock users you blocked");
  }

  connection.status = "rejected";
  connection.blockedBy = null;
  await connection.save();
  return { message: "User unblocked", connection };
};

const getAcceptedConnections = async (currentUserId) => {
  const connections = await connectionRepository.getAcceptedForUser(currentUserId);
  return Promise.all(connections.map((connection) => serializeConnection(connection, currentUserId)));
};

const getPendingRequests = async (currentUserId) => {
  const connections = await connectionRepository.getPendingForUser(currentUserId);
  return Promise.all(connections.map((connection) => serializeConnection(connection, currentUserId)));
};

const getBlockedUsers = async (currentUserId) => {
  const connections = await connectionRepository.getBlockedByUser(currentUserId);
  return Promise.all(connections.map((connection) => serializeConnection(connection, currentUserId)));
};

const getOrCreateChat = async (currentUserId, targetUserId) => {
  await assertTargetUser(currentUserId, targetUserId);

  const connection = await connectionRepository.findBetweenUsers(currentUserId, targetUserId);
  if (!connection || connection.status !== "accepted") {
    throw createHttpError(403, "You can only chat with accepted connections");
  }

  let chat = await chatRepository.findBetweenUsers(currentUserId, targetUserId);
  let wasCreated = false;

  if (!chat) {
    const createdChat = await chatRepository.createChat(currentUserId, targetUserId);
    chat = await chatRepository.findById(createdChat._id);
    wasCreated = true;
  }

  chat = await chatRepository.markReadForUser(chat._id, currentUserId);

  const messages = await messageRepository.getLatestForChat(chat._id, 20);

  return {
    _id: chat._id,
    participants: chat.participants.map(serializeUser),
    unreadCount: getUnreadCount(chat, currentUserId),
    latestMessage: chat.latestMessage || null,
    messages: messages.reverse(),
    wasCreated,
  };
};

const sendMessage = async (currentUserId, targetUserId, content) => {
  const trimmedContent = typeof content === "string" ? content.trim() : "";
  if (!trimmedContent) {
    throw createHttpError(400, "Message cannot be empty");
  }

  if (trimmedContent.length > 2000) {
    throw createHttpError(400, "Message must be 2000 characters or less");
  }

  await assertTargetUser(currentUserId, targetUserId);

  const connection = await connectionRepository.findBetweenUsers(currentUserId, targetUserId);
  if (!connection || connection.status !== "accepted") {
    throw createHttpError(403, "You can only message accepted connections");
  }

  let chat = await chatRepository.findBetweenUsers(currentUserId, targetUserId);
  if (!chat) {
    const createdChat = await chatRepository.createChat(currentUserId, targetUserId);
    chat = await chatRepository.findById(createdChat._id);
  }

  const message = await messageRepository.createMessage({
    chat: chat._id,
    sender: currentUserId,
    recipient: targetUserId,
    content: trimmedContent,
  });

  const updatedChat = await chatRepository.applyNewMessage(chat._id, message._id, targetUserId);

  return {
    message,
    chat: {
      _id: updatedChat._id,
      participants: updatedChat.participants.map(serializeUser),
      unreadCount: getUnreadCount(updatedChat, currentUserId),
      latestMessage: message,
      messages: [message],
      wasCreated: false,
    },
  };
};

module.exports = {
  sendConnectionRequest,
  acceptRequest,
  rejectRequest,
  blockUser,
  unblockUser,
  getAcceptedConnections,
  getPendingRequests,
  getBlockedUsers,
  getOrCreateChat,
  sendMessage,
  serializeConnection,
};

