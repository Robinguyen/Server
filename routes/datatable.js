const router  =  require("express").Router();
const pool = require("../db");
router.post("/data-table", async(req, res)=>{
    const {start_date, end_date, node_name, address,nump} = req.body;
    var data_name =[];
    var union_select = "";
    //search data
    var dataType = [];
    var value_table = [];
    //value search
    var value_search = "";
    const datacheck = ['node_data.node_name', 'node_data.address'];
    if(start_date == 'null' && end_date =='null' && node_name =="null" && address =='null' && nump !='null'){
        //get data_node_name
        const get_nameTable = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name like 'data_%';");
        for(let i in get_nameTable.rows){
            if(i == get_nameTable.rows.length-1){
                union_select += `SELECT CONCAT(start_time, '-',landing_time::time) as time, node_name as name, 
                address as addr, ROUND(COALESCE(((SELECT SUM(s) FROM 
                UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd,
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                account.username as user FROM (${get_nameTable.rows[i].table_name} natural join (node_data natural join account)) WHERE landing_time is not null 
                ORDER BY time DESC LIMIT 10 OFFSET ${nump * 10 - 10};;`
                break;
            }
            union_select += `SELECT CONCAT(start_time, '-',landing_time::time) as time, node_name as name, 
            address as addr, ROUND(COALESCE(((SELECT SUM(s) FROM 
            UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
            ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd,
            ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
            account.username as user FROM (${get_nameTable.rows[i].table_name} natural join (node_data natural join account)) WHERE landing_time is not null UNION ALL `
        }
        const data = await pool.query(union_select);
        return res.status(200).send(data.rows);
       
    }
    else{
        if (start_date != 'null' && end_date != 'null') {
        
            dataType.push('start_time::date >=' + `'${start_date}'` + ' AND start_time::date <=' + `'${end_date}'`);
        }
        value_table.push(node_name, address);
        for(let i in value_table){
            if(value_table[i]!='null'){
               dataType.push( `${datacheck[i]} = '${value_table[i]}'`);
            }
        }
       if(dataType.length>0){
            for(let i in dataType){
                if(i==dataType.length-1){
                    value_search += dataType[i] + " AND ";
                    break;
                }
                value_search += dataType[i] + " AND ";
            }
       }
       const get_nameTable = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name like 'data_%';");
        for(let i in get_nameTable.rows){
           
            if(i == get_nameTable.rows.length-1){
                union_select += `SELECT CONCAT(start_time, '-',landing_time::time) as time, node_name as name, 
                address as addr, ROUND(COALESCE(((SELECT SUM(s) FROM 
                UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd,
                ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
                account.username as user FROM (${get_nameTable.rows[i].table_name} natural join (node_data natural join account)) WHERE ${value_search} landing_time is not null 
                ORDER BY time DESC LIMIT 10 OFFSET ${nump * 10 - 10};`
                break;
            }
            union_select += `SELECT CONCAT(start_time, '-',landing_time::time) as time, node_name as name, 
            address as addr, ROUND(COALESCE(((SELECT SUM(s) FROM 
            UNNEST(temparature) s)/ array_length(temparature,1))::numeric),2) as temp, 
            ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(humidity) s)/array_length(humidity,1))::numeric),2) as humd,
            ROUND(coalesce(((SELECT SUM(s) FROM UNNEST(soil_moisture) s)/array_length(soil_moisture,1))::numeric),2) as soil,
            account.username as user FROM (${get_nameTable.rows[i].table_name} natural join (node_data natural join account)) WHERE ${value_search} landing_time is not null UNION ALL `
        }
        const data = await pool.query(union_select);
        return res.status(200).send(data.rows);
       
      
        
       
  

        
    }

})



module.exports = router;