const ApiError = require("../api-error");
const ReadersService = require("../services/readers.service");
const MongoDB = require("../utils/mongodb.util");

const signUp = async (req, res, next) => {
    const userData = req.body;
    try {
        const readersService = new ReadersService(MongoDB.client);
        const newUser = await readersService.signUp(userData);
        console.log(newUser)
        res.json(newUser);
    } catch (error) {
        next(error);
    }
};

const signIn = async (req, res, next) => {
    const { username, password } = req.body;
    console.log(req.body)
    try {
        const readersService = new ReadersService(MongoDB.client);
        const token  = await readersService.signIn(username, password);
        res.json({ token,message:"" });
    } catch (error) {
      next(error);
    }
  };

const findALL = async (req, res, next) => {
    let document = [];
    try {
        const readersService = new ReadersService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            document = await readersService.findByName(name);
            res.json({
                data: document,
                message: "FindByName success",
            })
        } else {
            document = await readersService.find({});
            res.json({
                data: document,
                message: "Find success",
            })
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the contact")
        );
    }
};

const findOne = async (req, res, next) => {
    try {
        const readersService = new ReadersService(MongoDB.client);
        const document = await readersService.findById(req.params.id);
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
        const readersService = new ReadersService(MongoDB.client);
        const document = await readersService.update(req.params.id, req.body);
        if (!document) {
            return next(
                new ApiError(404, "Contact not found")
            );
        }
        else return res.json({ message: "Contact was updated successfully" },)
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving contact with id=${req.params.id}`)
        );
    }
};

const deleteOne = async (req, res, next) => {
    try {
        const readersService = new ReadersService(MongoDB.client);
        const document = await readersService.delete(req.params.id);
        if (!document) {
            return next(
                new ApiError(404, "Contact not found")
            );
        }
        else return res.json({ message: "Contact was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving contact with id=${req.params.id}`)
        );
    }
};

const deleteAll = async (req, res, next) => {
    try {
        const readersService = new ReadersService(MongoDB.client);
        const deletedCount = await readersService.deleteAll();
        return res.json({
            message: `${deletedCount} contacts were deteled successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving favorite contacts")
        );
    }
};

const findAllFavorite = async (req, res, next) => {
    try {
        const readersService = new ReadersService(MongoDB.client);
        const document = await readersService.findFavorite();
        return res.json({
            message: "Find Favorite successfully",
            data: document
        })
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving favorite contacts")
        );
    }
};

module.exports = { signUp, signIn, findALL, findOne, update, deleteOne, deleteAll, findAllFavorite };