const mongoose = require("mongoose");
const { defaultAlbumImageBase64 } = require("../Db/imageBase64");

const songSchema = new mongoose.Schema({
    dateUpload: { type: Date, required: true, default: Date.now },
    filename: { type: String, require: true },
    name: { type: String, required: true },
    artist: { type: String, require: true, default: "Unknown" },
    albumImageBase64: {
        type: String,
        required: true,
        default: defaultAlbumImageBase64,
    },
    musicUrl: { type: String, required: true },
    favorite: { type: Boolean, require: true, default: false },
});

const userDataSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide username"],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, "please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        ],
    },
    password: {
        type: String,
        required: [true, "please provide password"],
        minlength: 3,
    },
    createDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    mostFavorites : [songSchema],
});



const userSongSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
        required: true,
    },
    songs: [songSchema],
});

const userPlaylistsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
        required: true,
    },
    playlist: [
        {
            title: { type: String },
            songs: [songSchema],
        },
    ],
});

const userData = mongoose.model("UserData", userDataSchema);
const userSongs = mongoose.model("UserSong", userSongSchema);
const userPlaylists = mongoose.model("UserPlaylist", userPlaylistsSchema);

module.exports = {
    songSchema,
    userData,
    userSongs,
    userPlaylists,
};
