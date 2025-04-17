const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');

function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

function createUserByEmailAndPassword(user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

function updateUserById(userId, updateData) {
  return db.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });
}



module.exports = {
  findUserByEmail,
  findUserById,
  createUserByEmailAndPassword,
  updateUserById,
};
