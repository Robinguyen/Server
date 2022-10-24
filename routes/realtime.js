const { json } = require('express');
const pool = require('../db');

const router  = require('express').Router();
//realtime
router.post("/upload-data", async(req,res)=>{
    try {
        const {node_id, temp, humd, soid, time, landing_time} = req.body;
        const node_name  = await pool.query(`SELECT node_name FROM node_data WHERE node_id = '${node_id}';`);
        console.log(node_name.rows)
        if(node_name.rows.length ==0){
            return res.status(401).send("Node id error");
        }
        const rt_name = `data_${node_name.rows[0].node_name}`;
        const check_datatable  = await pool.query(`SELECT data_id FROM ${rt_name} WHERE landing_time is null LIMIT 1;`);
        if(check_datatable.rows.length==0){
            //insert first data
            const i_data = await pool.query(`INSERT INTO ${rt_name} (node_id, temparature, humidity, soil_moisture, start_time, landing_time) VALUES 
            ('${node_id}','{${temp}}','{${humd}}','{${soid}}', ${time}, null);`);
            return res.status(200).json({"status":1})
        }
        else{
            if(landing_time=='null'){
            await pool.query(`UPDATE ${rt_name} SET temparature  = temparature || '{${temp}}', humidity = humidity|| '{${humd}}',
                             soil_moisture = soil_moisture || '{${soid}}'
                             WHERE landing_time is null;`);
            return res.status(200).send("insert is ok");
            }
            else{
                await pool.query(`UPDATE ${rt_name} SET temparature  = temparature || '{${temp}}', humidity = humidity|| '{${humd}}',
                             soil_moisture = soil_moisture || '{${soid}}', landing_time = ${landing_time}
                             WHERE landing_time is null;`);
            
                             return res.status(200).send("ok");
                            }
          
        }
       

    } catch (error) {
        return res.status(401).send("Server Erorr");        
    }
})
//get realtime
router.post("/get-realtime", async(req, res)=>{
    try {
        const {node_id}  = req.body;
        const node_name  = await pool.query(`SELECT node_name FROM node_data WHERE node_id = '${node_id}';`);
        if(node_name.rows.length ==0){
            return res.status(401).send("Node id error");
        }
        const rt_name = `data_${node_name.rows[0].node_name}`;
        const data =  await pool.query(`SELECT node_name as name, temparature[array_length(temparature,1)] as temp, humidity[array_length(humidity,1)] as humi, soil_moisture[array_length(soil_moisture,1)] as soil  
                                        FROM (${rt_name} NATURAL JOIN node_data) WHERE landing_time is null;`);
        if(data.rows.length==0){
            return res.status(401).send("No data");
        }
        else{
            return res.status(200).json({
                "name": data.rows[0].name,
                "temp": data.rows[0].temp,
                "humi": data.rows[0].humi,
                "soil": data.rows[0].soil
            });
        }
        
    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
//delete all realtime
router.post("/delete-realtime", async(req, res)=>{
    try {
        const {node_id} = req.body;
        //get node name
        const node_name  = await pool.query(`SELECT node_name FROM node_data WHERE node_id = '${node_id}';`);
        if(node_name.rows.length ==0){
            return res.status(401).send("Node id error");
        } 
        const rt_name = `data_${node_name.rows[0].node_name}`;
        await pool.query(`DELETE FROM ${rt_name};`);
        return res.status(200).send("Delete success");

    } catch (error) {
        return res.status(401).send("Server error");
    }
})
module.exports = router;