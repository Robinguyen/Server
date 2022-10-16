const router  = require("express").Router();
const pool = require("../db");
const brypt = require("bcrypt");

//create user


//login user
router.post("/login", async(req,res)=>{
    try {
        const {username, password}  = req.body;
        const user_account = await pool.query(`SELECT * FROM account WHERE username = '${username}';`);
        if(user_account.rows.length===0){
            return res.status(401).send(jwtToken: null, user: null, message: "Login fail");
        }
        const pass_checkPass =  await bryp

    } catch (error) {
        return res.status(401).send("Server Error");
    }
});


