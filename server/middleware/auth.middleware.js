import admin from "../firebaseAdmin.js";

export const protectRoute = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  // console.log(token);
  try {
    const decodeToken = await admin.auth().verifyIdToken(token);
    req.user = decodeToken;
    next();
  }catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Admin Middleware (Only allows specific users)
export const Admin = async (req, res, next) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);

    if (user.email !== process.env.Admin_email) {
      return res.json({ message: "Forbidden" });
    }

    next(); // Proceed to the next middleware or route
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
