const express = require("express");
const { createUsersSeeder, deleteUsersSeeder } = require("../../controllers/factory/usersFactoryMethods");
const { protect } = require("../../middleware/auth");

const router = express.Router();
router.route('/').post(createUsersSeeder);
router.route('/').delete(deleteUsersSeeder);

module.exports = router;
