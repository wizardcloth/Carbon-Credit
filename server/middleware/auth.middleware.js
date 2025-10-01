import admin from "../firebaseAdmin.js";

export const protectedRoute = async (req, res, next) => {
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

