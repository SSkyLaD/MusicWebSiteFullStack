const bcrypt = require("bcrypt");
const {
    userData,
    userSongs,
    userPlaylists,
} = require("../Models/user");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "asdf1234";

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await userData.findOne({ username: username });
        if (user) {
            return res.status(500).json({ msg: "Username already taken" });
        }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        const newUser = await userData.create({
            username: username,
            email: email,
            password: encryptedPassword,
        });
        await userSongs.create({ owner: newUser._id, songs: [] });
        await userPlaylists.create({ owner: newUser._id, playlist: [] });

        res.status(201).json({ msg: "Account created successfuly" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ msg: "Please provide username and password" });
    }
    // encrypt password
    let id = "";
    try {
        const user = await userData.findOne({ username: username });
        if (!user) return res.status(500).json({ msg: "Cannot find username" });
        const result = await bcrypt.compare(password, user.password);
        if (!result)
            return res.status(500).json({ msg: "Please check your password" });
        id = user._id;
    } catch (error) {
        return res.status(500).json({ msg: err.message });
    }
    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "30d" }); // giữ payload jwt bé // Phần này quan trọng tìm hiểu kĩ
    res.status(200).json({
        msg: "Login successfully",
        data: { token: token, username: username },
    });
};

module.exports = { login, register };
