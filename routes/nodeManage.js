const router = require("express").Router();
const nodemon = require("nodemon");
const pool = require("../db");
const authorization  = require("../middleware/authorization");
//create node
router.post("/create-node", async(req, res)=>{
    try {

        const {node_name, address, account_id} = req.body;
        //check data respone
        if(node_name=='null' || address == 'null' || account_id =='null'){
            return res.status(401).send("Error data")
        }
        //check exits node name
        const c_nodeName =  await pool.query(`SELECT node_name FROM node_data WHERE node_name  ='${node_name}';`);
        if(c_nodeName.rows.length>0){
            return res.status(401).send("Node name exits");
        }
        await pool.query(`INSERT INTO node_data(node_name, address, account_id) VALUES ('${node_name}','${address}','${account_id}');`);
        await pool.query(`CREATE TABLE data_${node_name} (data_id uuid default uuid_generate_v4() not null, 
                        node_id uuid not null, temparature real[][] not null,humidity real [][] not null, 
                        soil_moisture real[][] not null, start_time timestamp not null, landing_time timestamp,
                        PRIMARY KEY(data_id), FOREIGN KEY (node_id) REFERENCES node_data(node_id));`);
        return res.status(200).send("Create success");
    } catch (error) {
        return res.status(401).send("Server error");
    }
})
//get data node
router.post("/get-node", async(req, res)=>{
    try {
        const {node_id} = req.body;
        //check node id
        const c_node = await pool.query(`SELECT node_name FROM node_data WHERE node_id = '${node_id}';`);
        if(c_node.rows.length==0){
            return res.status(401).send("Error node id");
        }
        const get_node =  await pool.query(`SELECT node_name, address FROM node_data WHERE node_id = '${node_id}';`);
        return res.status(200).send(get_node.rows);
    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
//update node
router.post("/node-update", async(req, res)=>{
    try {
        const {node_id, node_name, address} = req.body;
        //check node_id
        const c_nodeid = await pool.query(`SELECT node_name FROM node_data WHERE node_id = '${node_id}';`);
        if(c_nodeid.rowCount.length ==0){
            return res.status(401).send("Error node ID");
        }
        await pool.query(`UPDATE node_data SET node_name = '${node_name}', address = '${address}';`);
        return res.status(200).send("Update success");

    } catch (error) {
        return res.status(401).send("Server Error");
    }
});
//delete node
router.post("/delete-node", async(req, res)=>{
    try {
        const {node_id} = req.body;
        //check node_id
        const c_nodeid = await pool.query(`SELECT node_id FROM node_data WHERE node_id = '${node_id}';`);
        if(c_nodeid.rowCount.length ==0){
            return res.status(401).send("Error node id");
        }
        await pool.query(`DELETE FROM node_data WHERE node_id = '${node_id}';`);
        return res.status(200).send("Delete success");
    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
module.exports = router;

