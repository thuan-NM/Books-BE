const { ObjectId } = require("mongodb");
class BooksService {
    constructor(client) {
        this.Books = client.db().collection("books");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractBookData(payload) {
        const book = {
            name: payload.name,
            price: payload.price,
            quantity: payload.quantity,
            pubyear: payload.pubyear,
            author: payload.author,
            bookPicture: payload.bookPicture,
            description: payload.description
        };
        // Remove undefined fields
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    }
    async create(data) {
        if (data.name=='') {
            return new ApiError(400, "Name can not be empty");
        }
        const book = this.extractBookData(data);
        const result = await this.Books.insertOne(
            book
        );
        return { result: result.value, message: "Create successfully!", isSuccess: true };
    }
    async find(filter) {
        const cursor = await this.Books.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.Books.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Books.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractBookData(payload);
        const result = await this.Books.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" },
        );
        if (!result) {
            return new ApiError(404, "Book not found");

        }
        return {
            result, message: "Update successfully!",
            isSuccess: true
        };
    }
    async delete(id) {
        const result = await this.Books.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        if (!result) {
            return next(
                new ApiError(404, "Book not found")
            );
        }
        return { result,message: "Book was deleted successfully",isSuccess:true }
    }
    async findFavorite() {
        return await this.find({ favorite: true });
    }
    async deleteAll() {
        const result = await this.Books.deleteMany({});
        return result.deletedCount;
    }
    async findByFilter(filter) {
        // If the filter includes a price range, update the filter to use MongoDB's $gte and $lte operators
        if (filter.price) {
            filter.price = { $gte: Number(filter.price.min), $lte: Number(filter.price.max) };
        }

        // If the filter includes authors, update the filter to use MongoDB's $in operator
        if (filter.author) {
            filter["author.name"] = { $in: filter.author };
        }
        delete filter.author
        const cursor = await this.Books.find(filter);

        return await cursor.toArray();
    }
}
module.exports = BooksService;
