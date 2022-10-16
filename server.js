const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const PORT =  process.env.PORT;

app.use("/login", require("./routes/login"));

app.listen(PORT, ()=>{
    console.log(`Server is starting on PORT ${PORT}`);
});