const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const PORT =  process.env.PORT;
app.use(cors());
app.use(express.json());
app.use("/account", require("./routes/user"));
app.use("/node", require("./routes/nodeManage"));
app.use("/realtime", require("./routes/realtime"));
app.use("/datamanage", require("./routes/dataManage"));
app.use("/data", require("./routes/datatable"));
//insert data
app.use("/insert", require("./testData/data"))


app.post('/test', async (req, res)=>{
    console.log("connect 01")
    res.send("Hello word");
})
app.listen(PORT, ()=>{
    console.log(`Server is starting on PORT ${PORT}`);
});