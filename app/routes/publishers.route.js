const express = require("express");
const publishers = require("../controllers/publishers.controller");

const router = express.Router();

router.route("/")
    .get(publishers.findALL)
    .post(publishers.create)
    .delete(publishers.deleteAll);

router.route("/:id")
    .get(publishers.findOne)
    .delete(publishers.deleteOne)
    .put(publishers.update);

module.exports = router;