const jwt = require('jsonwebtoken');
require('dotenv').config();

function jwtGeneretor(user_id){
    const payload = {
        user: {
            id:user_id
        }
    };
    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "10h"});
}
module.exports = jwtGeneretor;