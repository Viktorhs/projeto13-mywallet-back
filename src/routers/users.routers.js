import express from "express";
import * as usersController from "../controllers/users.controllers.js";

const router = express.Router();

router.post("/signup", usersController.signUp);
router.post("/signin", usersController.signIn);
router.delete("/logout", usersController.logout);

export default router;