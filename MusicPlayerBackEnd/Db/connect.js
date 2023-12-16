const mongoose = require('mongoose')

const connectDb = async(url) =>{
    try{
        await mongoose.connect(url);
        console.log(`Connect to database ${url}`);
    } catch(error){
        console.log(error);
    }
}

module.exports = connectDb;