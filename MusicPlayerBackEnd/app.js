const express = require("express");
const authenticateRouter = require("./Routes/auth");
const userRouter = require("./Routes/user");
const connectDb = require("./Db/connect");
const databaseURL = "mongodb://127.0.0.1:27017/MusicWeb";
const { notFound } = require("./MiddleWares/notFound");
const PORT = 5000;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authenticateRouter);

app.use(notFound);

const start = async () => {
    try {
        await connectDb(databaseURL);
        app.listen(PORT, () => {
            console.log(`Connected server is listing at ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
