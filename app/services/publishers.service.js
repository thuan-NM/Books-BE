const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
class PublishersService {
    constructor(client) {
        this.Publishers = client.db().collection("publishers");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractPublisherData(payload) {
        const publisher = {
            name: payload.name,
            address: payload.address,
        };
        // Remove undefined fields
        Object.keys(publisher).forEach(
            (key) => publisher[key] === undefined && delete publisher[key]
        );
        return publisher;
    }
    async create(data) {
        try {
            console.log(data.name)
            if (data.name == '') {
                return new ApiError(401, 'Name cant empty');
            }
            if (data.address == '') {
                return new ApiError(401, 'Address cant empty');
            }
            const publisher = this.extractPublisherData(data);
            const result = await this.Publishers.insertOne(
                publisher
            );
            return { result: result.value, message: "Create successfully!", isSuccess: true };
        } catch (error) {
            // Xử lý lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình tạo độc giả mới
            throw new ApiError(500, 'An error occurred while signing up');
        }
    }
    async find(filter) {
        const cursor = await this.Publishers.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.Publishers.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Publishers.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractPublisherData(payload);
        const result = await this.Publishers.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }
    async delete(id) {
        const result = await this.Publishers.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }
    async findFavorite() {
        return await this.find({ favorite: true });
    }
    async deleteAll() {
        const result = await this.Publishers.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = PublishersService;