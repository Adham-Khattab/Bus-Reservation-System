const express = require("express");
const router = express.Router();
const {
  addBus,
  deleteBus,
  removeDriver,
  getAllReservations,
} = require("../controllers/adminController");

router.post("/buses", addBus);
router.delete("/buses/:busNumber", deleteBus);
router.patch("/buses/:busNumber/remove-driver", removeDriver);
router.get("/reservations", getAllReservations);

module.exports = router;
