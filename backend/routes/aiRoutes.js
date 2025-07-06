const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { generateImageWithDalle } = require('../services/openaiService');

/**
 * @swagger
 * tags:
 *   name: AI Image Generation
 *   description: AI-powered image generation endpoints
 */

/**
 * @swagger
 * /api/ai/generate-image:
 *   post:
 *     summary: Generate image using AI
 *     tags: [AI Image Generation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Text prompt for image generation
 *               style:
 *                 type: string
 *                 description: Style preference (optional)
 *               size:
 *                 type: string
 *                 enum: [1024x1024, 1792x1024, 1024x1792]
 *                 default: 1024x1024
 *     responses:
 *       200:
 *         description: Image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       description: URL of the generated image
 *                     prompt:
 *                       type: string
 *                       description: The prompt used for generation
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI service error
 */

router.post('/generate-image', protect, async (req, res, next) => {
  try {
    const { prompt, style, size = '1024x1024' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required'
      });
    }

    // Generate image using DALL-E
    const result = await generateImageWithDalle(prompt, req.user.id, { style, size });

    res.status(200).json({
      status: 'success',
      data: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        designId: result.designId
      }
    });
  } catch (error) {
    console.error('AI image generation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate image',
      error: error.message
    });
  }
});

module.exports = router; 