const router = require("express").Router();
const pool = require("../db");
const moment =require("moment");
//giam sat thong qua bieu do
router.post("/data", async (req, res)=>{
    try {
        const {starttime, endtime, node_name, status} = req.body;
        var data_return = []
        if(node_name == 'null'){
            return res.status(401).send("No data");
        }
        //get node_id
        const node_id = await pool.query(`SELECT node_id as ndid FROM node_data WHERE node_name = '${node_name}';`);
        const name_table = "dt_" + (node_id.rows[0].ndid).replaceAll('-','_');
        if(status=='True'){
            if(starttime == 'null' && endtime == 'null'){
                //get data_id   
                var union_value="SELECT CONCAT(TO_CHAR(time:: TIMESTAMP, 'yyyy-mm-dd hh24'),':00:00') as time,  ROUND(AVG(temp)::numeric,2) as temp, ROUND(AVG(humd)::numeric,2) as humd, ROUND(AVG(soil)::numeric,2) as soil  FROM (";
                const data_id = await pool.query(`SELECT data_id FROM ${name_table} WHERE ((SELECT to_char(CURRENT_TIMESTAMP, 'YYYY-MM'))  = (SELECT to_char(start_time, 'YYYY-MM'))) 
                AND landing_time is not null ORDER BY start_time ASC;`);
            
                 //caculator 
                for(var value in data_id.rows){
                    if(value == data_id.rows.length-1){
                      union_value+=  `SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                    TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd hh24:mi:ss') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}') as t  group by TO_CHAR(time:: TIMESTAMP, 'yyyy-mm-dd hh24');`
                        break;
                    }
                    union_value+= `SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                    TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd hh24:mi:ss') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}' UNION ALL `;
        
                }
                const data_ = await pool.query(union_value);
                return res.status(200).send(data_.rows)
            }
            else{
                const data_id = await pool.query(`SELECT data_id FROM ${name_table} WHERE  to_char(start_time, 'YYYY-MM-DD') >= '${starttime}' AND   to_char(start_time, 'YYYY-MM-DD') <= '${endtime}' 
                AND landing_time is not null ORDER BY start_time ASC;`);
                var union_value="SELECT CONCAT(TO_CHAR(time:: TIMESTAMP, 'yyyy-mm-dd hh24'),':00:00') as time,  ROUND(AVG(temp)::numeric,2) as temp, ROUND(AVG(humd)::numeric,2) as humd, ROUND(AVG(soil)::numeric,2) as soil  FROM (";
                if(data_id.rows.length==0){
                    return  res.status(200).send([]);
                }
                for(var value in data_id.rows){
                    if(value == data_id.rows.length-1){
                      union_value+=  `SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                    TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd hh24:mi:ss') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}') as t  group by TO_CHAR(time:: TIMESTAMP, 'yyyy-mm-dd hh24');`
                        break;
                    }
                    union_value+= `SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                    TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd hh24:mi:ss') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}' UNION ALL `;
                    //data_return.push({time:data.rows[0].time, temp: data.rows[0].temp, humd : data.rows[0].humd, soil : data.rows[0].soil});
                }
                const data_ = await pool.query(union_value);
                
                return res.status(200).send(data_.rows)
            } 
            
        }
        else{
            var value_union = "SELECT time as time, ROUND(AVG(temp)::numeric,2) as temp, ROUND(AVG(humd)::numeric,2) as humd, ROUND(AVG(soil)::numeric,2) as soil FROM ("
            if(starttime == 'null' && endtime == 'null'){
                //get data_id  
                const data_id = await pool.query(`SELECT data_id FROM ${name_table} WHERE ((SELECT to_char(CURRENT_TIMESTAMP, 'YYYY-MM'))  = (SELECT to_char(start_time, 'YYYY-MM'))) 
                AND landing_time is not null ORDER BY start_time ASC;`);
              
                 //caculator 
                for(var value in data_id.rows){
                     if(value == data_id.rows.length-1){
                        value_union+=`SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                        ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                        ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                        TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}') as t GROUP BY time;`;
                        break;
                    }
                    value_union+=`SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                    ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                    TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}' UNION ALL `;
                }
                 const data = await pool.query(value_union);
                return res.status(200).send(data.rows)
            }
            else{
                const data_id = await pool.query(`SELECT data_id FROM ${name_table} WHERE  to_char(start_time, 'YYYY-MM-DD') >= '${starttime}' AND   to_char(start_time, 'YYYY-MM-DD') <= '${endtime}' 
                AND landing_time is not null ORDER BY start_time ASC;`);
                  //caculator 
                  for(var value in data_id.rows){
                    if(value == data_id.rows.length-1){
                       value_union+=`SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                       ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                       ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                       TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}') as t GROUP BY time;`;
                       break;
                   }
                   value_union+=`SELECT ROUND(COALESCE(((SELECT SUM(s) FROM UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                   ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd, 
                   ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                   TO_CHAR(start_time :: TIMESTAMP, 'yyyy-mm-dd') as time FROM ${name_table} WHERE data_id = '${data_id.rows[value].data_id}' UNION ALL `;
               }
                const data = await pool.query(value_union);
               return res.status(200).send(data.rows)
                
            }
            
        }
        

    } catch (error) {
        return res.status(401).send("Server Error");
    }
})
//data combobox
router.post("/cmb-data", async(req,res)=>{
    try {
        const cb_data = await pool.query("SELECT node_name as name, address as addr FROM node_data;");
        return res.status(200).send(cb_data.rows);
    } catch (error) {
        return res.status(401).send("Server Error");
    }
});

module.exports  =router;