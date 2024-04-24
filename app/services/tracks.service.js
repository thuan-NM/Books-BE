const { ObjectId } = require("mongodb");
const ReadersService = require("./readers.service")
class TracksService {
    constructor(client) {
        this.Tracks = client.db().collection("tracks");
        this.readersService = new ReadersService(client);
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractTrackData(payload) {
        const track = {
            book: payload.bookid,
            readerid: payload.readerid, // Sửa dòng này
            borroweddate: payload.borroweddate,
            returndate: payload.returndate,
        };
        // Remove undefined fields
        Object.keys(track).forEach(
            (key) => track[key] === undefined && delete track[key]
        );
        return track;
    }
    async create(payload) {
        const track = this.extractTrackData(payload);
        const result = await this.Tracks.insertOne(
            track
        );
        return result.value;
    }
    async find() {

        const tracks = await this.Tracks.find().toArray();
        for (let track of tracks) {
            track.reader = await this.readersService.findById(track.readerid);
            console.log(track.reader)
        }

        return tracks;
    }
    async findByUser(userId) {
        return await this.Tracks.find({
            "readerid": userId
        }).toArray();
    }
    async findById(id) {
        return await this.Tracks.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractTrackData(payload);
        const result = await this.Tracks.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }
    async delete(id) {
        const result = await this.Tracks.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        if (!result) {
            return next(
                new ApiError(404, "Tracks not found")
            );
        }
        return { result, message: "Tracks was deleted successfully", isSuccess: true };
    }
    async findFavorite() {
        return await this.find({ favorite: true });
    }
    async deleteAll() {
        const result = await this.Tracks.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = TracksService;