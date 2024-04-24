const express = require("express");
const books = require("../controllers/books.controller");

const router = express.Router();

router.route("/")
    .get(books.findALL)
    .post(books.create)
    .delete(books.deleteAll);
router.route("/:id")
    .get(books.findOne)
    .delete(books.deleteOne)
    .put(books.update);

module.exports = router;