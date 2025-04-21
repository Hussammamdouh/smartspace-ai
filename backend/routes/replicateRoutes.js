const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { generateImage } = require("../controllers/replicateImageController");

router.post("/generate", protect, generateImage);
module.exports = router;
