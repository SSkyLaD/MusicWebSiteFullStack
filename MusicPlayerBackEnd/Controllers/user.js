const { userData, userSongs, userPlaylists, Song } = require("../Models/user");
const { parseFile } = require("music-metadata");
const bcrypt = require("bcrypt");
const jsmediatags = require("jsmediatags");
const { type } = require("os");
const JWT_SECRET = "asdf1234";
const fs = require("fs").promises;
const staticStorageUrl = `D:/LaD/Study/Code/.vscode/AllAboutWebDev/Learning/Project/MusicPlayerFullStack/MusicPlayerStaticFileServer/UserData/userFile`;

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

const getUserSongData = async(req,res) =>{
    try{
        const {id} = req.user;
        const {id: songId} = req.params;
        const userSongsData = await userSongs.findOne({owner:id}).populate("songs");
        if(!userSongsData){
            return res.status(404).json({ msg: "cannot find user songs data" });
        }
        const song = userSongsData.songs.filter((song)=> song._id.toString()===songId);
        const filenameParts = song[0].filename.split(".");
        const type = filenameParts[filenameParts.length - 1];
        const {name,artist,album,year,duration}= song[0]
        res.status(200).json({msg: {name,artist,album,year,duration,type}});
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ msg: err });
    }
}

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
        const encodedFileName = encodeURIComponent(filename);
        newSong.musicUrl = `/${req.user.username}/${encodedFileName}`;

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
    getUserSongData,
    getUserData,
    deleteUser,
    getUserSongs,
    uploadUserSongs,
    deleteUserSong,
    updateUserSong,
    getUserFavoriteSongs,
    downloadUserSong,
};
