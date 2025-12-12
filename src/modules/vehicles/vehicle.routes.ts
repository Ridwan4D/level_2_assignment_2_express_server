import { Router } from "express";
import { vehiclesController } from "./vehicle.controller";
import auth from "../../middleware/auth";

const router = Router();
const {
  createVehicle,
  getVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
} = vehiclesController;

router.post("/", auth("admin"), createVehicle);
router.get("/", getVehicles);
router.get("/:vehicleId", getSingleVehicle);
router.put("/:vehicleId", auth("admin"), updateVehicle);
router.delete("/:vehicleId", auth("admin"), deleteVehicle);

export const vehicleRouter = router;
