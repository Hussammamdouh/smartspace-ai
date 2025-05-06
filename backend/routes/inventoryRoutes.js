const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// POST (create)
router.post("/", protect, upload.single("file"), inventoryController.addInventoryItem);

// PUT (update)
router.put("/:id", protect, upload.single("file"), inventoryController.updateInventoryItem);

// DELETE
router.delete("/:id", protect, inventoryController.deleteInventoryItem);

// GET
router.get("/", protect, inventoryController.getInventory);
router.get("/:id", protect, inventoryController.getInventoryItem);

module.exports = router;
