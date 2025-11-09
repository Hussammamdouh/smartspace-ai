const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { uploadWithCloudinary, uploadAvatarWithCloudinary, uploadFileWithCloudinary } = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /api/upload/test-connection:
 *   get:
 *     summary: Test Cloudinary connection
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Connection test result
 */
router.get('/test-connection', uploadController.testConnection);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: "Upload an image (field name: image)"
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 */
router.post('/image', protect, uploadWithCloudinary, uploadController.uploadImage);

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: "Upload an avatar image (field name: avatar)"
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post('/avatar', protect, uploadAvatarWithCloudinary, uploadController.uploadImage);

/**
 * @swagger
 * /api/upload/file:
 *   post:
 *     summary: "Upload a file (field name: file)"
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/file', protect, uploadFileWithCloudinary, uploadController.uploadImage);

/**
 * @swagger
 * /api/upload/delete/{public_id}:
 *   delete:
 *     summary: Delete an image from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete('/delete/:public_id', protect, uploadController.deleteImage);

module.exports = router;



