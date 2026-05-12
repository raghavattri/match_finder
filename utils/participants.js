const mongoose = require("mongoose");

const makeParticipantsKey = (firstUserId, secondUserId) => {
  return [firstUserId.toString(), secondUserId.toString()].sort().join(":");
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = {
  makeParticipantsKey,
  isValidObjectId,
};

