const jwt = require('jsonwebtoken');
const JWT_SECRET = 'asdf1234';

const authenticationMiddleware = (req,res,next) =>{
    const authorizeHeader = req.headers.authorization;
    if(!authorizeHeader || !authorizeHeader.startsWith('Bearer ')){
        res.status(400).json({msg:'No token provided'});
    }
    const token = authorizeHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        const {id,username} = decoded;
        req.user ={id,username};
        next();
    } catch{
        return res.status(401).json({msg:'Not authorize to access this route'});
    }
}

module.exports = {authenticationMiddleware};