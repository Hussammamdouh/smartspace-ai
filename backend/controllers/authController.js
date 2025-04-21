const authService = require('../services/authService');

// Register
exports.registerUser = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({ success: true, token: accessToken, user });
  } catch (error) {
    next(error);
  }
};

// Login
exports.loginUser = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ success: true, token: accessToken, user });
  } catch (error) {
    next(error);
  }
};

// Refresh Token Endpoint
exports.refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

  try {
    const accessToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ token: accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
