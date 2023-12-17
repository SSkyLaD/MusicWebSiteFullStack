const express = require("express");
const {
    getUserData,
    deleteUser,
    getUserSongs,
    deleteUserSong,
    updateUserSong,
    getUserFavoriteSongs,
    downloadUserSong,
    getUserSongData,
} = require("../Controllers/user");
const { uploadUserSongs } = require("../Controllers/user");
const {upload} = require('../MiddleWares/uploadSongsConfig')
const { authenticationMiddleware } = require("../MiddleWares/auth");
const router = express.Router();

router.route("/")
    .delete(authenticationMiddleware, deleteUser)
    .get(authenticationMiddleware,getUserData);
router.route("/songs")
    .post(authenticationMiddleware, upload.single('file'),uploadUserSongs)
    .get(authenticationMiddleware, getUserSongs);
router.route("/songs/:id")
    .get(authenticationMiddleware,getUserSongData)
    .patch(authenticationMiddleware,updateUserSong)
    .delete(authenticationMiddleware,deleteUserSong);
router.route("/songs/favorites")
    .get(authenticationMiddleware,getUserFavoriteSongs)
router.route("/songs/download/:id")
    .get(authenticationMiddleware,downloadUserSong)

module.exports = router;
