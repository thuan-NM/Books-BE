const express = require("express")
const cors = require("cors");
const booksRouter = require("./app/routes/books.route");
const readersRouter = require("./app/routes/readers.route");
const StaffsRouter = require("./app/routes/staffs.route");
const PublishersRouter = require("./app/routes/publishers.route");
const TracksRouter = require("./app/routes/tracks.route")
const ApiError = require("./app/api-error");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/books", booksRouter);
app.use("/api/readers", readersRouter);
app.use("/api/staffs", StaffsRouter);
app.use("/api/publishers", PublishersRouter);
app.use("/api/tracks", TracksRouter);

app.use((req, res, next) => {
    // Code ở đây sẽ chạy khi không có route được định nghĩa nào
    // khớp với yêu cầu. Gọi next() để chuyển sang middleware xử lý lỗi
    return next(new ApiError(404, "Resource not found"));
});

app.use((error, req, res, next) => {
    // Middleware xử lý lỗi tập trung.
    // Trong các đoạn code xử lý ở các route, gọi next(error)
    // sẽ chuyển về middleware xử lý lỗi này
    return res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
    });
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to contact book application. " });
});

module.exports = app;