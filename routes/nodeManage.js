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
       const node_id  = await pool.query(`INSERT INTO node_data(node_name, address, account_id) VALUES ('${node_name}','${address}','${account_id}') RETURNING node_id;`);
        const realtime_name = "dt_" + (node_id.rows[0].node_id).replaceAll('-', '_');
        await pool.query(`CREATE TABLE ${realtime_name} (data_id uuid default uuid_generate_v4() not null, 
                        node_id uuid not null, temparature real[][] not null,humidity real [][] not null, 
                        soil_moisture real[][] not null, start_time timestamp not null, landing_time timestamp,
                        PRIMARY KEY(data_id), FOREIGN KEY (node_id) REFERENCES node_data(node_id));`);
        return res.status(200).send("Create success");
    } catch (error) {
        return res.status(401).send("Server error");
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
router.post("/get-nodecb", async(req,res)=>{
    try {
        var node_resp = "";
        var address_resp="";
        var data_resp = [];
        const node_name = await pool.query("SELECT node_name as name FROM node_data;");
        const address = await pool.query("SELECT DISTINCT address as addr FROM node_data;");
        for(let value in node_name.rows){
            if(value == node_name.rows.length-1){
                node_resp += node_name.rows[value].name;
                break;
            }
           node_resp += node_name.rows[value].name + ","
        }
        data_resp.push({name:node_resp});
        for(let value in address.rows){
            if(value == address.rows.length-1){
                address_resp += address.rows[value].addr;
                break;
            }
            address_resp += address.rows[value].addr + ","
        }
        data_resp.push({addr: address_resp});
        return res.status(200).send(data_resp);
    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
//get node data
var n_name="", a_name="";
var total_node="";
router.post("/get-node", async (req, res)=>{
    try {
        const {node_name, address, page} = req.body;
       
        if(node_name=='null' && address =='null' && page!='null'){
            if(n_name!=node_name || a_name!=address){
                total_node="";
                const data = await pool.query("SELECT COUNT(node_id) as ndid FROM node_data;")
                
                total_node = Math.ceil(data.rows[0].ndid/10);
                n_name=node_name;
                a_name=address;
               
            }
            const get_node =  await pool.query(`SELECT node_name as name, address as addr, status as stat, 
                                                account.username as user FROM (node_data natural join account) 
                                                LIMIT 10 OFFSET ${page * 10 - 10};`);
            get_node.rows.push({spag:total_node});
            return res.status(200).send(get_node.rows);
           
        }
        else{
            if(node_name!='null' && address=='null'){
                if(n_name!=node_name || a_name!=address){
                    total_node="";
                    const data = await pool.query(`SELECT COUNT(node_id) as ndid FROM (node_data natural join account) 
                                                    WHERE node_data.node_name = '${node_name}';`);
                                                   
                    total_node = Math.ceil(data.rows[0].ndid/10);
                    n_name=node_name;
                    a_name=address;
                }
                
                const data_node = await pool.query(`SELECT node_name as name, address as addr, status as stat, 
                                                account.username as user FROM (node_data natural join account) 
                                                WHERE node_data.node_name = '${node_name}' LIMIT 10 OFFSET ${page * 10 - 10};`)
                
                data_node.rows.push({spag:total_node})
                return res.status(200).send(data_node.rows);
            }
            if(address!='null' && node_name =='null'){
                if(n_name!=node_name || a_name!=address){
                    total_node="";
                    const data = await pool.query(`SELECT COUNT(node_id) as ndid FROM (node_data natural join account) 
                                                    WHERE node_data.address = '${address}';`)
                    total_node = Math.ceil(data.rows[0].ndid/10);
                    n_name=node_name;
                    a_name=address;
                }
                const data = await pool.query(`SELECT node_name as name, address as addr, status as stat, account.username as user FROM (node_data natural join account) WHERE node_data.address = '${address}'  LIMIT 10 OFFSET ${page * 10 - 10};`)
                data.rows.push({spag:total_node});
                return res.status(200).send(data.rows);
            }
        }
        
    } catch (error) {
        return res.status(401).send("Server error");
    }
});

module.exports = router;

