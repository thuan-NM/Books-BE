const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
class StarffsService {
    constructor(client) {
        this.Staffs = client.db().collection("staffs");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractStaffData(payload) {
        const reader = {
            username: payload.username,
            fullName: payload.fullName,
            password: payload.password,
            position: payload.position,
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
            const user = await this.Staffs.findOne({ username: { $regex: new RegExp(userData.username), $options: "i" }, });
            if (userData.password=='') {
                return new ApiError(401, 'Password is required');
            }
            if (userData.fullName=='') {
                return new ApiError(401, 'Fullname is required');
            }
            if (userData.username=='') {
                return new ApiError(401, 'Username is required');
            }
            if (userData.position=='') {
                return new ApiError(401, 'Position is required');
            }
            if (userData.address=='') {
                return new ApiError(401, 'Address is required');
            }
            if (userData.phone=='') {
                return new ApiError(401, 'Phone is required');
            }
            // Hash mật khẩu trước khi lưu vào CSDL
            // Thêm mật khẩu đã được hash vào dữ liệu người dùng
            if (user) {
                return new ApiError(401, 'Username is exist');
            }
            const userToCreate = userData;

            delete userToCreate.confirmPassword;
            // Tạo một độc giả mới trong CSDL
            const newUser = await this.Staffs.insertOne(userToCreate);

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
            const user = await this.Staffs.findOne({ username: { $regex: new RegExp(username), $options: "i" }, });

            // Kiểm tra xem người dùng có tồn tại không
            if (!user) {
                return new ApiError(401, 'Username is not exist');
            }

            // So sánh mật khẩu đã nhập với mật khẩu đã lưu của người dùng
            if (password != user.password) {
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
        const cursor = await this.Staffs.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.Staffs.find({
            lastName: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Staffs.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractStaffData(payload);
        const result = await this.Staffs.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }
    async delete(id) {
        const result = await this.Staffs.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }
    async findFavorite() {
        return await this.find({ favorite: true });
    }
    async deleteAll() {
        const result = await this.Staffs.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = StarffsService;