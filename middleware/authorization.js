const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next){
    const token  = req.header('jwt_token');
   
    console.log(token)
    //check if not token
    if(!token){
        return res.status(403).json({msg: "authorization denied"});
    }
    try {
        //it is goinh to give use the user id (user:{user_id})
        const verify = jwt.verify(token, process.env.jwtSecret);
        req.user = verify.user;
        next();
    } catch (error) {
        return res.status(401).json({msg: "Token is not valid"});
    }
};