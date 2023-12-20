const multer = require("multer");
const path = require("path");
const fs = require("fs");
require('dotenv').config()
const UserDataPath =process.env.STATIC_STORAGE;
const maxSize = 100* 1000 *1000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userFolderName = req.user.username;
        const destination = path.join(UserDataPath, userFolderName);

        if (!fs.existsSync(destination)) {
            try {
                fs.mkdirSync(destination, { recursive: true });
            } catch (error) {
                console.error("Error creating destination folder:", error);
                return cb(error, null);
            }
        }

        cb(null, destination);
    },
    filename: (req, file, cb) => {
        const uniquePrefix = Date.now();
        // tạo unique file name nhằm tránh ghi đè nếu upload 2 file có cùng tên
        cb(null, uniquePrefix + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["audio/mpeg", "audio/flac"];

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true); // Chấp nhận file
    } else {
        req.fileValidationError = { msg: "Only MP3/FLAC accepted" };
        cb(null, false);
    }
};

const upload = multer({ storage, fileFilter ,limits: { fileSize: maxSize}});

module.exports = { upload };
