const { userSongs} = require("../Models/user");

const songLimitCheck = async (req,res,next) =>{
    const { id } = req.user;
    const userSongsData = await userSongs.findOne({ owner: id });
    if(userSongsData.songs.length > 400){
        return res.status(500).json({ msg: "User reached maximum limit" });
    }
    next()
}

module.exports = {songLimitCheck}