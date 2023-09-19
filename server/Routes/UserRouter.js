import express from "express";
import {
  addLikedMovies,
  changeUSerPassword,
  deleteLikedMovies,
  deleteUser,
  deleteUserProfile,
  getLikedMovies,
  getUsers,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../Controllers/UsersController.js";
import { admin, protect } from "../middlewares/Auth.js";
const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);
//-----PRIVATE ROUTERS-------
router.put("/", protect, updateUserProfile);
router.delete("/", protect, deleteUserProfile);
router.put("/password", protect, changeUSerPassword);
router.get("/favorites", protect, getLikedMovies);
router.post("/favorites", protect, addLikedMovies);
router.delete("/favorites", protect, deleteLikedMovies);

//---------ADMIN ROUTES---------
router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUser);
export default router;
