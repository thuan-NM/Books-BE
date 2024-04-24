const ApiError = require("../api-error");
const BooksService = require("../services/books.service");
const MongoDB = require("../utils/mongodb.util");

const create = async (req, res, next) => {
    try {
        const booksService = new BooksService(MongoDB.client);
        const document = await booksService.create(req.body);
        return res.json({
            document,
            message: "",
        });
    } catch (error) {
        console.log(error)
        return next(
            new ApiError(500, "An error occurred while creating the contact")
        );
    }
};

const findALL = async (req, res, next) => {
    let document = [];
    try {
        const booksService = new BooksService(MongoDB.client);
        const { name, price, author } = req.query;
        let filter = {};

        if (name) {
            document = await booksService.findByName(name);
        } else if (price || author) {
            if (price) {
                filter.price = price;
            }
            if (author) {
                filter.author = author;
            }
            document = await booksService.findByFilter(filter);
        } else {
            document = await booksService.find({});
        }
        console.log(name)
        res.json({
            data: document,
            message: "Find success",
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the contact")
        );
    }
};

const findOne = async (req, res, next) => {
    try {
        const booksService = new BooksService(MongoDB.client);
        const document = await booksService.findById(req.params.id);
        if (!document) {
            return new (new ApiError(404, "Contact not found"));
        }
        return res.json({
            data: document,
            message: "Success"
        })
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving contact with id=${req.params.id}`)
        );
    }
};

const update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(
            new ApiError(400, "Data to update can not be empty")
        );
    }
    try {
        const booksService = new BooksService(MongoDB.client);
        const document = await booksService.update(req.params.id, req.body);

        return res.json({ document, message: "" })
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving contact with id=${req.params.id}`)
        );
    }
};

const deleteOne = async (req, res, next) => {
    try {
        const booksService = new BooksService(MongoDB.client);
        const document = await booksService.delete(req.params.id);
        return res.json({document,message:""});
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving contact with id=${req.params.id}`)
        );
    }
};

const deleteAll = async (req, res, next) => {
    try {
        const booksService = new BooksService(MongoDB.client);
        const deletedCount = await booksService.deleteAll();
        return res.json({
            message: `${deletedCount} contacts were deteled successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving favorite contacts")
        );
    }
};


module.exports = { create, findALL, findOne, update, deleteOne, deleteAll };