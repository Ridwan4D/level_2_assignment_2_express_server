import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router();
const { getUser, updateUser, deleteUser } = userController;

router.get("/", auth("admin"), getUser);
router.put("/:userId", auth("admin", "customer"), updateUser);
router.delete("/:userId", auth("admin"), deleteUser);

export const userRouters = router;
