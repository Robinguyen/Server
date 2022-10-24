const router = require("express").Router();
const pool = require("../db");
//giam sat thong qua bieu do
router.post("/data", async (req, res)=>{
    try {
        const {starttime, endtime, node_name} = req.body;
        var data_return = []
        if(node_name == 'null'){
            return res.status(401).send("No data");
        }
        const name_table = "data_" + `${node_name}`;
        if(starttime == 'null' && endtime == 'null'){
            //get data_id
            const data_id = await pool.query(`SELECT data_id FROM ${name_table} WHERE ((SELECT to_char(CURRENT_TIMESTAMP, 'YYYY-MM'))  = (SELECT to_char(start_time, 'YYYY-MM'))) 
            AND landing_time is not null;`);
             //caculator 
            for(var value in data_id.rows){
                const data  = await pool.query(`SELECT  ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                start_time as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}';`);
                data_return.push({time: data.rows[0].time, temp: data.rows[0].temp, humd : data.rows[0].humd, soil : data.rows[0].soil});
                
            }
            return res.status(200).send(data_return)
        }
        else{
            const data_id = await pool.query(`SELECT data_id FROM ${name_table} WHERE  to_char(start_time, 'YYYY-MM-DD') >= '${starttime}' AND   to_char(start_time, 'YYYY-MM-DD') <= '${endtime}' 
            AND landing_time is not null;`);
            for(var value in data_id.rows){
                const data  = await pool.query(`SELECT  ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                start_time as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}';`);
                data_return.push({time: data.rows[0].time, temp: data.rows[0].temp, humd : data.rows[0].humd, soil : data.rows[0].soil});
            }
            return res.status(200).send(data_return)
        }
    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
module.exports  =router;