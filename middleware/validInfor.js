module.exports = function (req, res, next){
    
    const {username, email, password} = req.body;
    function valiEmail(userEmail){
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }
    if(req.path === "/register"){
        if(![ username, email, password].every(Boolean)){
            return res.json("Missing Credentials");
        } else if(!valiEmail(email)){
            return res.json("Invalid Email");
        }
    } 
    next();
}; 