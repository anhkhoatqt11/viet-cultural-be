const { db } = require('../../utils/db');
const { hashToken } = require('../../utils/hash');

// used when we create a refresh token.
function addRefreshTokenToWhitelist({ refreshToken, userId }) {
  return db.refresh_tokens.create({
    data: {
      hashed_token: hashToken(refreshToken),
      user_id_id: userId,
      updated_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      expire_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    },
  });
}

// used to check if the token sent by the client is in the database.
function findRefreshToken(token) {
  return db.refresh_tokens.findUnique({
    where: {
      hashed_token: hashToken(token),
    },
  });
}

// soft delete tokens after usage.
function deleteRefreshTokenById(id) {
  return db.refresh_tokens.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

function revokeTokens(userId) {
  return db.refresh_tokens.updateMany({
    where: {
      user_id_id: userId,
    },
    data: {
      revoked: true,
    },
  });
}



module.exports = {
  addRefreshTokenToWhitelist,
  findRefreshToken,
  deleteRefreshTokenById,
  revokeTokens,
};
