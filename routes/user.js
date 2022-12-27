const router  = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGeneretor = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfor");
const authorization = require("../middleware/authorization");
const { route } = require("./nodeManage");
//create user
router.post("/register", validInfo, async(req, res)=>{
    try {
        const {username, email, password} = req.body;
        const c_userName = await pool.query(`SELECT * FROM account WHERE email = '${email}';`);
        if(c_userName.rows.length>0){
            return res.status(401).send("User already exixt");
        }
        //Bcrypt the user password
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        //inser new user  database
        let n_userName = await pool.query(`INSERT INTO account (username, email, password) VALUES ('${username}', '${email}','${bcryptPassword}') RETURNING * ;`);
        
        //generate iwt token
        const jwt_token = jwtGeneretor(n_userName.rows[0].account_id);
        return res.json({jwt_token});
    } catch(err){
        return res.status(401).send("Server Error");
    }
});
//login user
router.post("/login", async(req,res)=>{
    try {
        const {email, password}  = req.body;
        const user_account = await pool.query(`SELECT username, password FROM account WHERE email = '${email}';`);
        console.log(user_account.rows.length)
        if(user_account.rows.length===0){
            return res.status(401).send({jwtToken: null, user: null, message: "Login fail"});
        }
        //check password database
       
        const validPass = await bcrypt.compare(password, user_account.rows[0].password);
        if(!validPass){
            return res.status(401).send({jwtToken: null, user: null, message: "Fail password"});
        }

        //generate token
        const jwtToken = jwtGeneretor(user_account.rows[0].account_id);
        return res.json({jwtToken: jwtToken, user: user_account.rows[0].username, message: "Login successful"});

    } catch (error) {
        return res.status(401).send("Server Error");
    }
});
//get infor user
router.post("/get-user", async(req,res)=>{
    try {
        const {account_id} = req.body;
        //check user_id
        const c_userid = await pool.query(`SELECT account_id FROM account WHERE account_id = '${account_id}';`);
        if(c_userid.rows.length==0){
            return res.status(401).send("Error account id");

        }
        const get_user = await pool.query(`SELECT account_id, username, email FROM account WHERE account_id = '${account_id}';`);
        return res.status(200).send(get_user.rows);
    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
//update user
router.post("/update-user", async(req,res)=>{
    try {
        const {account_id, username, email, password} = req.body;
        //check account id
        const c_account = await pool.query(`SELECT account_id FROM account WHERE account_id = '${account_id}';`);
        if(c_account.rows.length==0){
            return res.status(401).send("Eror account id")
        }
        else{
            if(password!='null'){
                const salt = await bcrypt.genSalt(10);
                const bcryptPassword = await bcrypt.hash(password, salt);
                await pool.query(`UPDATE account SET password = '${bcryptPassword}' WHERE account_id = '${account_id}';`);
            }
            if(username!='null'){
                await pool.query(`UPDATE account SET username = '${username}' WHERE account_id = '${account_id}';`);
            }
            if(email!='null'){
                await pool.query(`UPDATE account SET email = '${email}' WHERE account_id = '${account_id}';`);
            }

            return res.status(200).send("Update success");

        }
        
    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
module.exports = router;

