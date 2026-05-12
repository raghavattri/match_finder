const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./models/user");
const Connection = require("./models/connection");
const Chat = require("./models/chat");
const Message = require("./models/message");
const { makeParticipantsKey } = require("./utils/participants");

dotenv.config();

const url = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/matchfinder";
const password = "password123";

const raghavId = new mongoose.Types.ObjectId("69f4e7b00f5b45491feb6bc0");
const ids = {
  raghav: raghavId,
  isha: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dc3"),
  zoya: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dd5"),
  meera: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dd2"),
  sanya: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dcf"),
  kabir: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dcc"),
  arjun: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dd4"),
  aarav: new mongoose.Types.ObjectId("69f4f5cd5ecae0055ec80dc0"),
  rohan: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dc6"),
  ananya: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dc9"),
  vikram: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80dcd"),
  naina: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80de1"),
  dev: new mongoose.Types.ObjectId("69f4f5ce5ecae0055ec80de4"),
};

const seedUsers = [
  {
    _id: ids.raghav,
    name: "Raghav Sharma",
    age: 26,
    gender: "male",
    hobbies: ["Gaming", "Traveling", "Dancing"],
    location: "Karnal",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    email: "raghavattri13@gmail.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.isha,
    name: "Isha Patel",
    age: 24,
    gender: "female",
    hobbies: ["Dancing", "Music", "Yoga", "Traveling"],
    location: "Delhi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    email: "isha@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.zoya,
    name: "Zoya Khan",
    age: 25,
    gender: "female",
    hobbies: ["Music", "Traveling", "Sports", "Gaming"],
    location: "Lucknow",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    email: "zoya@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.meera,
    name: "Meera Reddy",
    age: 26,
    gender: "female",
    hobbies: ["Cooking", "Dancing", "Art"],
    location: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    email: "meera@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.sanya,
    name: "Sanya Malhotra",
    age: 23,
    gender: "female",
    hobbies: ["Swimming", "Photography", "Traveling"],
    location: "Pune",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400",
    email: "sanya@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.kabir,
    name: "Kabir Das",
    age: 27,
    gender: "male",
    hobbies: ["Yoga", "Reading", "Technology"],
    location: "Kolkata",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
    email: "kabir@example.com",
    spamReports: 1,
    blocked: false,
  },
  {
    _id: ids.arjun,
    name: "Arjun Kapoor",
    age: 29,
    gender: "male",
    hobbies: ["Gaming", "Movies", "Hiking"],
    location: "Ahmedabad",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    email: "arjun@example.com",
    spamReports: 3,
    blocked: false,
  },
  {
    _id: ids.aarav,
    name: "Aarav Sharma",
    age: 26,
    gender: "male",
    hobbies: ["Photography", "Traveling", "Gaming"],
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    email: "aarav@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.rohan,
    name: "Rohan Gupta",
    age: 28,
    gender: "male",
    hobbies: ["Cooking", "Hiking", "Technology"],
    location: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    email: "rohan@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.ananya,
    name: "Ananya Iyer",
    age: 25,
    gender: "female",
    hobbies: ["Reading", "Art", "Movies", "Dancing"],
    location: "Chennai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    email: "ananya@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.vikram,
    name: "Vikram Singh",
    age: 30,
    gender: "male",
    hobbies: ["Sports", "Gardening", "Music"],
    location: "Jaipur",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    email: "vikram@example.com",
    spamReports: 0,
    blocked: false,
  },
  {
    _id: ids.naina,
    name: "Naina Verma",
    age: 24,
    gender: "female",
    hobbies: ["Gaming", "Traveling", "Photography"],
    location: "Gurugram",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
    email: "naina.spamtest@example.com",
    spamReports: 9,
    blocked: false,
  },
  {
    _id: ids.dev,
    name: "Dev Malhotra",
    age: 31,
    gender: "male",
    hobbies: ["Gaming", "Technology", "Movies"],
    location: "Noida",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
    email: "dev.blockedspam@example.com",
    spamReports: 10,
    blocked: true,
  },
];

const profileExtrasByEmail = {
  "raghavattri13@gmail.com": {
    bio: "Product-minded gamer who loves spontaneous food plans, late-night drives, and finding new playlists.",
    lookingFor: "A warm, playful connection with someone who enjoys travel, music, and real conversations.",
    storyPrompt: "My ideal first date",
    storyAnswer: "Coffee, a walk through a busy market, and a small challenge like finding the best street snack nearby.",
  },
  "isha@example.com": {
    bio: "Dance class regular, coffee enthusiast, and weekend planner who is happiest around music and good energy.",
    lookingFor: "Someone curious, kind, and ready to explore new cafes or live music nights.",
    storyPrompt: "I will never say no to",
    storyAnswer: "A playlist swap, a sunset walk, or dessert after dinner.",
  },
  "zoya@example.com": {
    bio: "Playlist collector, sports fan, and travel person who loves easy conversations and thoughtful plans.",
    lookingFor: "A fun connection with shared hobbies and room for slow, honest chemistry.",
    storyPrompt: "A green flag I notice",
    storyAnswer: "Someone who remembers small details and treats people kindly when nobody is watching.",
  },
};

const buildProfileExtras = (user) => profileExtrasByEmail[user.email] || ({
  bio: `Based in ${user.location}, into ${user.hobbies.slice(0, 3).join(", ").toLowerCase()}, and always up for a thoughtful conversation.`,
  lookingFor: "A genuine connection with shared interests and easy conversation.",
  storyPrompt: "A perfect weekend looks like",
  storyAnswer: `Good food, ${user.hobbies[0]?.toLowerCase() || "music"}, and discovering a new place in the city.`,
});

const connectionFixtures = [
  { requester: ids.raghav, recipient: ids.isha, status: "accepted" },
  { requester: ids.zoya, recipient: ids.raghav, status: "accepted" },
  { requester: ids.meera, recipient: ids.raghav, status: "pending" },
  { requester: ids.sanya, recipient: ids.raghav, status: "pending" },
  { requester: ids.raghav, recipient: ids.kabir, status: "blocked", blockedBy: ids.raghav },
  { requester: ids.arjun, recipient: ids.raghav, status: "blocked", blockedBy: ids.raghav },
  { requester: ids.raghav, recipient: ids.naina, status: "pending" },
];

const chatFixtures = [
  {
    participants: [ids.raghav, ids.isha],
    unreadForRaghav: 2,
    messages: [
      { sender: ids.raghav, recipient: ids.isha, content: "Hey Isha, your travel photos are amazing." },
      { sender: ids.isha, recipient: ids.raghav, content: "Thank you! I saw you like dancing too." },
      { sender: ids.isha, recipient: ids.raghav, content: "Want to plan a weekend coffee chat?" },
    ],
  },
  {
    participants: [ids.raghav, ids.zoya],
    unreadForRaghav: 1,
    messages: [
      { sender: ids.zoya, recipient: ids.raghav, content: "Gaming plus travel is a rare combo." },
      { sender: ids.raghav, recipient: ids.zoya, content: "That is basically my personality." },
      { sender: ids.zoya, recipient: ids.raghav, content: "Then we should compare playlists next." },
    ],
  },
];

const upsertUsers = async () => {
  const hashedPassword = await bcrypt.hash(password, 10);

  for (const user of seedUsers) {
    const profileExtras = buildProfileExtras(user);
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      existingUser.name = user.name;
      existingUser.age = user.age;
      existingUser.gender = user.gender;
      existingUser.hobbies = user.hobbies;
      existingUser.location = user.location;
      existingUser.avatar = user.avatar;
      existingUser.bio = profileExtras.bio;
      existingUser.lookingFor = profileExtras.lookingFor;
      existingUser.storyPrompt = profileExtras.storyPrompt;
      existingUser.storyAnswer = profileExtras.storyAnswer;
      existingUser.spamReports = user.spamReports;
      existingUser.blocked = user.blocked;
      existingUser.password = existingUser.password || hashedPassword;
      await existingUser.save();
      console.log(`Updated user: ${user.name}`);
      continue;
    }

    await User.create({
      ...user,
      ...profileExtras,
      password: hashedPassword,
      matches: [],
    });
    console.log(`Created user: ${user.name}`);
  }
};

const resetDemoRelationships = async () => {
  const seedUserIds = seedUsers.map((user) => user._id);
  const participantKeys = connectionFixtures.map((connection) =>
    makeParticipantsKey(connection.requester, connection.recipient)
  );

  await Connection.deleteMany({ participantsKey: { $in: participantKeys } });
  await Chat.deleteMany({ participantsKey: { $in: participantKeys } });
  await Message.deleteMany({
    $or: [{ sender: { $in: seedUserIds } }, { recipient: { $in: seedUserIds } }],
  });

  await User.updateMany(
    { _id: { $in: seedUserIds } },
    { $set: { matches: [] } }
  );
};

const seedConnections = async () => {
  const legacyMatchesByUser = new Map();

  for (const fixture of connectionFixtures) {
    const connection = await Connection.create({
      requester: fixture.requester,
      recipient: fixture.recipient,
      participantsKey: makeParticipantsKey(fixture.requester, fixture.recipient),
      status: fixture.status,
      blockedBy: fixture.blockedBy || null,
    });

    if (!legacyMatchesByUser.has(fixture.requester.toString())) {
      legacyMatchesByUser.set(fixture.requester.toString(), []);
    }

    legacyMatchesByUser.get(fixture.requester.toString()).push({
      userId: fixture.recipient,
      status: fixture.status === "accepted" ? "accepted" : "pending",
    });

    if (fixture.status === "pending") {
      if (!legacyMatchesByUser.has(fixture.recipient.toString())) {
        legacyMatchesByUser.set(fixture.recipient.toString(), []);
      }
      legacyMatchesByUser.get(fixture.recipient.toString()).push({
        userId: fixture.requester,
        status: "pending",
      });
    }

    console.log(`Seeded ${fixture.status} connection: ${connection.participantsKey}`);
  }

  for (const [userId, matches] of legacyMatchesByUser.entries()) {
    await User.findByIdAndUpdate(userId, { $set: { matches } });
  }
};

const seedChats = async () => {
  for (const fixture of chatFixtures) {
    const [firstUser, secondUser] = fixture.participants;
    const chat = await Chat.create({
      participants: fixture.participants,
      participantsKey: makeParticipantsKey(firstUser, secondUser),
      unreadCounts: [
        { userId: firstUser, count: firstUser.equals(ids.raghav) ? fixture.unreadForRaghav : 0 },
        { userId: secondUser, count: secondUser.equals(ids.raghav) ? fixture.unreadForRaghav : 0 },
      ],
    });

    const messages = [];
    for (const [index, message] of fixture.messages.entries()) {
      messages.push(
        await Message.create({
          ...message,
          chat: chat._id,
          createdAt: new Date(Date.now() - (fixture.messages.length - index) * 60 * 1000),
        })
      );
    }

    chat.latestMessage = messages[messages.length - 1]._id;
    await chat.save();
    console.log(`Seeded chat: ${chat.participantsKey}`);
  }
};

const seedDB = async () => {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB for seeding");

    await upsertUsers();
    await resetDemoRelationships();
    await seedConnections();
    await seedChats();

    console.log("\nDatabase seeded successfully");
    console.log("Primary test account:");
    console.log("  email: raghavattri13@gmail.com");
    console.log("  password: password123 (only if the account is newly created)");
    console.log("\nSeeded scenarios for Raghav Sharma:");
    console.log("  Accepted Connections: Isha Patel, Zoya Khan");
    console.log("  Pending Requests: Meera Reddy, Sanya Malhotra");
    console.log("  Blocked Users: Kabir Das, Arjun Kapoor");
    console.log("  Spam Test Users: Naina Verma has 9 reports, Dev Malhotra has 10 and is globally blocked");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();

