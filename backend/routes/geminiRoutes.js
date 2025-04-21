const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { generateImage } = require("../controllers/geminiImageController");

const router = express.Router();

router.post("/generate-image", protect, generateImage);
module.exports = router;
