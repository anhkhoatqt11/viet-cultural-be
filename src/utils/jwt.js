const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Token valid for 3 days
function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '3d',
  });
}

function generateRefreshToken() {
  const token = crypto.randomBytes(16).toString('base64url');
  return token;
}

function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
};
