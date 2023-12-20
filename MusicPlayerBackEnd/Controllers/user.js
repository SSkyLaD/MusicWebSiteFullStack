const { userData, userSongs, userPlaylists, Song } = require("../Models/user");
require("dotenv").config();
const { parseFile } = require("music-metadata");
const bcrypt = require("bcrypt");
const fs = require("fs").promises;
const fsSync = require("fs");
const staticStorageUrl = process.env.STATIC_STORAGE;
const CryptoJS = require('crypto-js');

// Chưa test
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
        const userSong = await userSongs.findOneAndDelete({ owner: user._id });
        await userPlaylists.deleteOne({ owner: user._id });
        for (const songId of userSong.songs) {
            await Song.findByIdAndDelete(songId);
        }

        res.status(200).json({ msg: "Success" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

//OK
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

//
const getUserSongs = async (req, res) => {
    const { id, username } = req.user;
    try {
        const userSongsData = await userSongs
            .findOne({ owner: id })
            .populate("songs");
        if (!userSongsData) {
            return res
                .status(404)
                .json({ msg: `Cannot find data for ${username}` });
        }
        res.status(200).json({
            msg: "Success",
            data: userSongsData.songs,
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

        const newSong = {}

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

        newSong.filename = filename;

        //get metadata
        const metadata = await parseFile(path);
        newSong.name = metadata.common.title ? metadata.common.title : primaryTitle;
        newSong.artist = metadata.common.artist ? metadata.common.artist : primaryArtist;
        newSong.album = metadata.common.album ? metadata.common.album : "";
        newSong.duration = metadata.format.duration ? Math.round(metadata.format.duration) : "";
        newSong.year = metadata.common.year ? metadata.common.year : "";
        if(metadata.common.picture){
            const imageFormat = metadata.common.picture[0].format;
            const base64Image = metadata.common.picture[0].data.toString('base64');
            newSong.albumImageBase64 = `data:${imageFormat};base64,${base64Image}`;
        }

        const userSongsData = await userSongs.findOne({ owner: id });
        if (!userSongsData) {
            return res.status(404).json({ msg: "cannot find user songs data" });
        }

        const song = await Song.create(newSong);
        userSongsData.songs.push(song);
        await userSongsData.save();

        return res.status(200).json({ msg: "File uploaded successfully!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error.message });
    }
};

//WTFISTHIS
const getUserSong = async (req,res) =>{
    try{
        //
        const { id:songId, user:encryptedUsername } = req.params;
        username = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encryptedUsername))
        //
        const song = await Song.findById(songId);
        if(!song){
            return res.status(404).json({ msg: "cannot find user song" });
        }
        const staticSongPath =
        staticStorageUrl + "/" + username + "/" + song.filename;

        const stat = fsSync.statSync(staticSongPath);
        const total = stat.size;

        const range = req.headers.range;
        const parts = range.replace(/bytes=/, '').split('-');
        const partialStart = parts[0];
        const partialEnd = parts[1];

        const start = parseInt(partialStart, 10);
        const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
        const chunksize = (end - start) + 1;
        const rstream = fsSync.createReadStream(staticSongPath, {start: start, end: end});

        res.writeHead(206, {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
            'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
            'Content-Type': 'audio/flac'
        });
        rstream.pipe(res);
    }
    catch(err){
        console.log(err)
        res.status(500).json({ msg: err });
    }
}
//

const deleteUserSong = async (req, res) => {
    try {
        const { id, username } = req.user;
        const { id: songId } = req.params;
        const userSongsData = await userSongs.findOne({ owner: id });
        if (!userSongsData) {
            return res.status(404).json({ msg: "cannot find user songs data" });
        }
        userSongsData.songs.pull({ _id: songId });
        await userSongsData.save();
        const song = await Song.findByIdAndDelete(songId);
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
        const userSongsData = await userSongs.findOne({ owner: id }).populate("songs");
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
        console.log(favorite);
        const { id: songId } = req.params;
        if (favorite === null) {
            return res.status(400).json({ msg: "Bad request" });
        }
        const song = await Song.findOne({ _id: songId });
        if (!song) {
            return res.status(404).json({ msg: "Cannot find song" });
        }
        song.duration = parseInt(song.duration);
        song.favorite = favorite;
        await song.save();
        res.status(200).json({ msg: "Success" });
    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

const downloadUserSong = async (req, res) => {
    try {
        const { id, username } = req.user;
        console.log(id,username);
        const { id: songId } = req.params;
        const userSongsData = await userSongs.findOne({ owner: id }).populate("songs");
        if (!userSongsData) {
            return res.status(404).json({ msg: "Cannot find user songs data" });
        }
        const song = userSongsData.songs.filter(
            (song) => song._id.toString() === songId
        );
        if (!song) return res.status(404).json({ msg: "Cannot find song" });
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
    getUserSong,
    deleteUserSong,
    updateUserSong,
    getUserFavoriteSongs,
    downloadUserSong,
};
