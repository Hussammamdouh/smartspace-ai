const express = require('express');
const { protect } = require("../middlewares/authMiddleware");
const { handleUnifiedChat } = require("../controllers/openaiController");
const router = express.Router();

router.post("/unified", protect, handleUnifiedChat);
module.exports = router;
