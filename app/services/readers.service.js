const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
class ReadersService {
    constructor(client) {
        this.Readers = client.db().collection("readers");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractReaderData(payload) {
        const reader = {
            username: payload.username,
            firstName: payload.firstName,
            lastName: payload.lastName,
            password: payload.password,
            dob: payload.dob,
            gender: payload.gender,
            address: payload.address,
            phone: payload.phone,
        };
        // Remove undefined fields
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    }
    async signUp(userData) {
        try {
            const user = await this.Readers.findOne({ username: { $regex: new RegExp(userData.username), $options: "i" }, });
            if (user != null) {
                return new ApiError(401, 'Username is exist');
            }
            // Hash mật khẩu trước khi lưu vào CSDL
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Thêm mật khẩu đã được hash vào dữ liệu người dùng
            const userToCreate = {
                ...userData,
                password: hashedPassword,
            };

            delete userToCreate.confirmPassword;
            // Tạo một độc giả mới trong CSDL
            const newUser = await this.Readers.insertOne(userToCreate);

            // Trả về thông tin về người dùng vừa tạo
            return { newUser: newUser, message: "Sign up successfully!", isSuccess: true };
        } catch (error) {
            // Xử lý lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình tạo độc giả mới
            throw new ApiError(500, 'An error occurred while signing up');
        }
    }


    async signIn(username, password) {
        try {
            // Tìm người dùng với email được cung cấp
            const user = await this.Readers.findOne({ username: { $regex: new RegExp(username), $options: "i" }, });

            // Kiểm tra xem người dùng có tồn tại không
            if (!user) {
                return new ApiError(401, 'Username is not exist');
            }

            // So sánh mật khẩu đã nhập với mật khẩu đã lưu của người dùng
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return new ApiError(401, 'Wrong password');
            }

            // Tạo một JWT token cho người dùng
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log(token)
            return { token, message: "Sign in successfully!", isSuccess: true };
        } catch (error) {
            return new ApiError(500, 'An error occurred while signing in');
        }
    }
    async find(filter) {
        const cursor = await this.Readers.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.Readers.find({
            lastName: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Readers.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractReaderData(payload);
        const result = await this.Readers.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }
    async delete(id) {
        const result = await this.Readers.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }
    async findFavorite() {
        return await this.find({ favorite: true });
    }
    async deleteAll() {
        const result = await this.Readers.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = ReadersService;