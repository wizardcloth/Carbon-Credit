// backend/controllers/auth.controller.js
import User from "../Model/User.js";
import { v4 as uuidv4 } from "uuid";

export const authCallback = async (req, res) => {
  try {
    const { id: firebaseUID, firstName, lastName, email, imageUrl } = req.body;

    // Use firebaseUID as primary identifier (or UUID if not provided)
    const userId = firebaseUID || uuidv4();

    let user = await User.findOne({ _id: userId });

    if (user) {
      console.log("✅ User already exists:", user._id);
    } else {
      user = await User.create({
        _id: userId,
        firstName: firstName,
        lastName: lastName,
        email: email || null,
        imageUrl: imageUrl || null,
      });
      console.log("🎉 User created successfully:", user._id);
    }

    res.status(201).json({
      message: "User authenticated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error during authentication:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
