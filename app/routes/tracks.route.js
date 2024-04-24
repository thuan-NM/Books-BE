const express = require("express");
const tracks = require("../controllers/tracks.controller");

const router = express.Router();

router.route("/")
    .get(tracks.findALL)
    .post(tracks.create)
    .delete(tracks.deleteAll);

router.route("/:id")
    .get(tracks.findOne)
    .delete(tracks.deleteOne)
    .put(tracks.update);

module.exports = router;