const { GoogleGenerativeAI } = require("@google/generative-ai");
const { APIError } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return next(new APIError('Prompt is required and must be a non-empty string', 400));
    }

    if (prompt.length > 1000) {
      return next(new APIError('Prompt is too long (max 1000 characters)', 400));
    }

    logger.info('Gemini image generation request:', { prompt: prompt.substring(0, 100) + '...' });

    // Use Gemini Pro Vision for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    // Create a comprehensive prompt for interior design
    const enhancedPrompt = `
      Create a detailed interior design description for: ${prompt.trim()}
      
      Requirements:
      - Photorealistic interior design
      - Professional lighting and composition
      - Modern, high-quality furniture
      - Cohesive color scheme
      - Proper room layout and proportions
      
      Style guidelines:
      - No cartoon or 3D-rendered styles
      - Natural, realistic appearance
      - Magazine-quality interior photography
      - Warm, inviting atmosphere
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: enhancedPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    const content = response.text();

    if (!content || content.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    logger.info('Gemini response generated successfully');

    res.status(200).json({ 
      status: 'success',
      data: { 
        content,
        prompt: enhancedPrompt,
        model: 'gemini-1.5-pro'
      }
    });
  } catch (error) {
    logger.error('Gemini image generation error:', error);
    
    if (error.message.includes('API_KEY')) {
      return next(new APIError('Gemini API key is invalid or missing', 500));
    } else if (error.message.includes('quota')) {
      return next(new APIError('Gemini API quota exceeded', 429));
    } else if (error.message.includes('rate limit')) {
      return next(new APIError('Rate limit exceeded. Please try again later.', 429));
    } else if (error.message.includes('content policy')) {
      return next(new APIError('Content violates Gemini usage policies', 400));
    } else {
      return next(new APIError('Failed to generate image. Please try again.', 500));
    }
  }
};

exports.generateText = async (req, res, next) => {
  try {
    const { prompt, messages = [] } = req.body;

    if (!prompt && messages.length === 0) {
      return next(new APIError('Prompt or messages are required', 400));
    }

    logger.info('Gemini text generation request');

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    let result;
    
    if (messages.length > 0) {
      // Use conversation history
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      // Add system message for interior design context
      await chat.sendMessage(`
        You are an expert interior designer and AI assistant. 
        Help users with interior design advice, room planning, color schemes, 
        furniture selection, and design inspiration. 
        Provide practical, actionable advice with specific recommendations.
      `);

      // Send user messages
      for (const message of messages) {
        if (message.role === 'user' && message.content) {
          await chat.sendMessage(message.content);
        }
      }

      result = await chat.sendMessage(prompt || messages[messages.length - 1]?.content || '');
    } else {
      // Single prompt request
      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
    }

    const response = await result.response;
    const content = response.text();

    if (!content || content.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    logger.info('Gemini text response generated successfully');

    res.status(200).json({ 
      status: 'success',
      data: { 
        content,
        model: 'gemini-1.5-pro'
      }
    });
  } catch (error) {
    logger.error('Gemini text generation error:', error);
    
    if (error.message.includes('API_KEY')) {
      return next(new APIError('Gemini API key is invalid or missing', 500));
    } else if (error.message.includes('quota')) {
      return next(new APIError('Gemini API quota exceeded', 429));
    } else if (error.message.includes('rate limit')) {
      return next(new APIError('Rate limit exceeded. Please try again later.', 429));
    } else if (error.message.includes('content policy')) {
      return next(new APIError('Content violates Gemini usage policies', 400));
    } else {
      return next(new APIError('Failed to generate response. Please try again.', 500));
    }
  }
};
