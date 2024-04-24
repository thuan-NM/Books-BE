const express = require("express");
const staffs = require("../controllers/staff.controller");

const router = express.Router();

router.route("/")
    .get(staffs.findALL)
    .delete(staffs.deleteAll);

router.route("/:id")
    .get(staffs.findOne)
    .delete(staffs.deleteOne)
    .put(staffs.update);
router.route("/auth/signin")
    .post(staffs.signIn)
router.route("/auth/signup")
    .post(staffs.signUp)
module.exports = router;