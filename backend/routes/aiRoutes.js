const express = require('express');
const router = express.Router();
const { protect, imageGenerationLimiter } = require('../middlewares/auth');
const { generateImageWithDalle } = require('../services/openaiService');
const logger = require('../utils/logger');

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

router.post('/generate-image', protect, imageGenerationLimiter, async (req, res, next) => {
  try {
    const { prompt, style, size = '1024x1024', quality = 'standard' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required'
      });
    }

    // Validate quality parameter
    if (quality && !['standard', 'hd'].includes(quality)) {
      return res.status(400).json({
        status: 'error',
        message: 'Quality must be either "standard" or "hd"'
      });
    }

    // Validate size parameter
    const validSizes = ['1024x1024', '1792x1024', '1024x1792'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        status: 'error',
        message: `Size must be one of: ${validSizes.join(', ')}`
      });
    }

    // Generate image using DALL-E with retry mechanism
    let result;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        result = await generateImageWithDalle(prompt, req.user.id, { 
          style, 
          size,
          quality 
        });
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        logger.error(`Image generation attempt ${retries} failed:`, error);
        
        if (retries >= maxRetries) {
          throw error; // Re-throw if max retries reached
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        designId: result.designId,
        cached: result.cached || false,
        quality: quality,
        size: size
      }
    });
  } catch (error) {
    logger.error('AI image generation error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to generate image';
    let statusCode = 500;
    
    if (error.response) {
      // OpenAI API error
      if (error.response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        statusCode = 429;
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.error?.message || 'Invalid prompt. Please try a different description.';
        statusCode = 400;
      } else if (error.response.status === 401) {
        errorMessage = 'API authentication failed. Please contact support.';
        statusCode = 401;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 