import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
//protection middleware
const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      //set token from Bearer token in header
      token = req.headers.authorization.split(" ")[1];
      //Verify token and get User id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //get User id from decoded token
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } else {
      console.log(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const admin = (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized as an admin!");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export { generateToken, protect, admin };
