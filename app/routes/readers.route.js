const express = require("express");
const readers = require("../controllers/readers.controller");

const router = express.Router();

router.route("/")
    .get(readers.findALL)
    .delete(readers.deleteAll);

router.route("/:id")
    .get(readers.findOne)
    .delete(readers.deleteOne)
    .put(readers.update);
router.route("/auth/signin")
    .post(readers.signIn)
router.route("/auth/signup")
    .post(readers.signUp)
module.exports = router;