const express = require("express");
require("dotenv").config();
const authenticateRouter = require("./Routes/auth");
const userRouter = require("./Routes/user");
const connectDb = require("./Db/connect");
const { notFound } = require("./MiddleWares/notFound");
const cors = require("cors");
const morgan = require('morgan')
const PORT = process.env.BACKEND_PORT || 5000;
const databaseURL = process.env.MONGODB_URL;

const app = express();
app.use(
    cors({
        origin: process.env.FRONTEND_ORIGIN,
    })
);
app.use(express.json(),morgan('tiny'));
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
