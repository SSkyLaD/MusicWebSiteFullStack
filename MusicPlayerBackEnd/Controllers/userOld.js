const {
    userData,
    userSongs,
    userFavorite,
    userPlaylists,
} = require("../Models/userOld");
const bcrypt = require("bcrypt");
const jsmediatags = require("jsmediatags");
const JWT_SECRET = "asdf1234";
const fs = require("fs").promises;
const staticStorageUrl = `D:/LaD/Study/Code/.vscode/AllAboutWebDev/Learning/Project/MusicPlayerFullStack/MusicPlayerStaticFileServer/UserData/userFile`;

const deleteUser = async (req, res) => {
    const { id } = req.user;
    const password = req.body.password;
    try {
        if (!password) {
            res.status(401).json({ msg: "Please provide old password" });
        }
        const user = await userData.findOne({ _id: id });
        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.status(500).json({ msg: "Please check your password" });
        }
        await userData.deleteOne({ _id: user._id });
        await userSongs.deleteOne({ owner: user._id });
        await userFavorite.deleteOne({ owner: user._id });
        await userPlaylists.deleteOne({ owner: user._id });

        res.status(200).json({ msg: "Success" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getUserData = async (req, res) => {
    const { id } = req.user;
    try {
        const reqUserData = await userData.findOne({ _id: id });

        if (!reqUserData)
            return res.status(404).json({ msg: "cannot find user data" });
        const { username, createDate, mostFavorites } = reqUserData;
        const userSongData = await userSongs.findOne({ owner: id });
        if (!userSongData)
            return res.status(404).json({ msg: "cannot find user songs data" });
        const numberOfSongs = userSongData.songs.length;
        res.status(200).json({
            msg: { username, createDate, mostFavorites, numberOfSongs },
        });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
};

const getUserSongs = async (req, res) => {
    const { id, username } = req.user;
    try {
        const userSongsData = await userSongs.findOne({ owner: id });
        if (!userSongsData) {
            return res
                .status(404)
                .json({ msg: `Cannot find data for ${username}` });
        }
        const { songs } = userSongsData;
        res.status(200).json({
            msg: "Success",
            data: songs,
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const uploadUserSongs = async (req, res) => {
    try {
        const { id } = req.user;
        const { filename, path } = req.file;
        if (req.fileValidationError) {
            return res.status(400).json(req.fileValidationError);
        }

        const replaceRex = new RegExp(".mp3|.flac");
        const filenameSplited = filename.split("-");
        let primaryTitle;
        let primaryArtist;
        if (!filenameSplited[2]) {
            primaryTitle = filenameSplited[1].replace(replaceRex, "").trim();
        } else {
            primaryArtist = filenameSplited[1].replace(replaceRex, "").trim();
            primaryTitle = filenameSplited[2].replace(replaceRex, "").trim();
        }
        const newSongData = {};
        newSongData.filename = filename;
        const encodedFileName = encodeURIComponent(filename);
        newSongData.musicUrl = `/${req.user.username}/${encodedFileName}`;
        //promise không thì newSongData null
        await new Promise((resolve, reject) => {
            jsmediatags.read(path, {
                onSuccess: function (tag) {
                    const { title, artist, picture } = tag.tags;

                    newSongData.name = title ? title : primaryTitle;
                    newSongData.artist = artist ? artist : primaryArtist;

                    if (picture) {
                        const data = Buffer.from(picture.data);
                        const base64Url =
                            `data:${picture.format};base64,` +
                            data.toString("base64");
                        newSongData.albumImageBase64 = base64Url;
                    }
                    resolve();
                },
                onError: function (error) {
                    console.error("Error reading tags:", error);
                    newSongData.name = primaryTitle;
                    newSongData.artist = primaryArtist;
                    resolve();
                },
            });
        });

        const userSongsData = await userSongs.findOne({ owner: id });
        if (!userSongsData) {
            return res.status(404).json({ msg: "cannot find user songs data" });
        }

        userSongsData.songs.push(newSongData);
        await userSongsData.save();

        return res.status(200).json({ msg: "File uploaded successfully!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error.message });
    }
};

const deleteUserSong = async (req, res) => {
    try {
        const { id, username } = req.user;
        const { id: songId } = req.params;
        const userSongsData = await userSongs.findOne({ owner: id });
        if (!userSongsData) {
            return res.status(404).json({ msg: "cannot find user songs data" });
        }
        const song = userSongsData.songs.id(songId);
        userSongsData.songs.pull({ _id: songId });
        await userSongsData.save();
        const staticSongPath =
            staticStorageUrl + "/" + username + "/" + song.filename;
        await fs.unlink(staticSongPath);
        res.status(200).json({ msg: "delete successfully" });
    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

const getUserFavoriteSongs = async (req, res) => {
    try {
        const { id } = req.user;
        const userSongsData = await userSongs.findOne({ owner: id });

        if (!userSongsData) {
            return res.status(404).json({ msg: "Cannot find user songs data" });
        }

        const favoriteSongs = userSongsData.songs.filter(
            (song) => song.favorite === true
        );

        res.status(200).json({ msg: "Success", data: favoriteSongs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error });
    }
};

const updateUserSong = async (req, res) => {
    try {
        const { favorite } = req.body;
        const { id } = req.user;
        const { id: songId } = req.params;
        if (favorite === null) {
            return res.status(400).json({ msg: "Bad request" });
        }
        const userSongsData = await userSongs.findOne({ owner: id });
        if (!userSongsData) {
            return res.status(404).json({ msg: "Cannot find user songs data" });
        }
        const index = userSongsData.songs.findIndex(
            (song) => song._id.toString() === songId
        );
        if (index === -1) {
            return res.status(404).json({ msg: "Cannot find song" });
        }
        userSongsData.songs[index].favorite = favorite;
        await userSongsData.save();
        res.status(200).json({ msg: "Success" });
    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

const downloadUserSong = async (req, res) => {
    try {
        const { id, username } = req.user;
        const { id: songId } = req.params;
        const userSongsData = await userSongs.findOne({ owner: id });
        if (!userSongsData) {
            return res.status(404).json({ msg: "Cannot find user songs data" });
        }
        const song = userSongsData.songs.filter(
            (song) => song._id.toString() === songId
        );
        if (!song) return res.status(404).json({ msg: "Cannot find song" });
        console.log(song[0].filename);
        const file = staticStorageUrl + "/" + username + "/" + song[0].filename;
        res.status(200).download(file);
    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

module.exports = {
    getUserData,
    deleteUser,
    getUserSongs,
    uploadUserSongs,
    deleteUserSong,
    updateUserSong,
    getUserFavoriteSongs,
    downloadUserSong,
};
