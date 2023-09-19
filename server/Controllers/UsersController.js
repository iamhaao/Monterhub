import User from "../Models/UserModel.js";
import bcrybt from "bcryptjs";
import { generateToken } from "../middlewares/Auth.js";
// ---------------PUBLIC CONTROLLER------
const registerUser = async (req, res) => {
  const { name, email, password, image } = req.body;
  try {
    const userExists = await User.findOne({ email });
    //check if user exists
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    //else create User
    const salt = await bcrybt.genSalt(10);
    const hashedPassword = await bcrybt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      image,
    });
    //If user create successfull  send userdata and token to client
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && bcrybt.compare(password, user.password)) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// ---------------PRIVATE CONTROLLER------
const updateUserProfile = async (req, res, next) => {
  const { name, email, image } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.image = image || user.image;
      const updateUser = await user.save();
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        image: updateUser.image,
        isAdmin: updateUser.isAdmin,
        token: generateToken(updateUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteUserProfile = async (req, res, next) => {
  try {
    const user = User.findById(req.user._id);
    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Cant delete admin account");
      }
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const changeUSerPassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user && bcrybt.compare(oldPassword, user.password)) {
      const salt = await bcrybt.genSalt(10);
      const hashedPassword = await bcrybt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();
      res.json({ message: "Password changed!" });
    } else {
      res.status(401);
      throw new Error("Invalid old password");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getLikedMovies = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("likedMovies");
    if (user) {
      res.json(user.likedMovies);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const addLikedMovies = async (req, res, next) => {
  const { movieId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      // if (user?.likedMovies) {
      //   const isMovieLiked = user.likedMovies.forEach(
      //     (movie) => movie.toString() === movieId
      //   );
      //   if (isMovieLiked) {
      //     res.status(400);
      //     throw new Error("Movie already liked");
      //   }
      // }
      user.likedMovies.push(movieId);
      await user.save();
      res.json(user.likedMovies);
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteLikedMovies = async (req, res, next) => {
  const moiveId = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.likedMovies = [];
      await user.save();
      res.status(200).json({ message: "All liked movies deleted sucessfully" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//--------------------ADMIN CONTROLLER----------

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Cant delete admin user");
      }
      await user.deleteOne();
      res.json({ message: "USer delected successfull" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  changeUSerPassword,
  getLikedMovies,
  addLikedMovies,
  deleteLikedMovies,
  getUsers,
  deleteUser,
};
