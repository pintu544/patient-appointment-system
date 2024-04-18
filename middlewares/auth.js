const jwt = require('jsonwebtoken');
const { produceError } = require('../utils/error');
exports.authenticated = (req, res, next) => {
    const authHeader = req.get('Authorization');
    try{
        if(!authHeader){
            throw produceError(' there isnt any token therefore user should login' , 401)
        }
        const token = authHeader.split(" ")[1];//Bearer Token => [Bearer , Token]
        const decodedToken = jwt.verify(token , process.env.JWT_SECRET);
        if(!decodedToken){
            throw  produceError('user should login' , 401)
        }
        req.userId = decodedToken.userId
        next();
    }catch(err){
        next(err)
    }
};
