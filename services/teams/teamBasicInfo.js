import teamBasicInfoQuery from "../../db/teams/teamBasicInfoQuery"
import mysql from 'mysql2'
import { dbConfig } from "../../utils";


//For each team in the json object, insert/update the database
export const teamBasicInfo = async (teams) => {
    const pool = mysql.createPool(dbConfig);
    const promisePool = pool.promise();  
    for (const team of teams) { 
        let success = await teamBasicInfoQuery(team, pool);
        if (!success){
            return false;
        } 
    }
    pool.end();
    return true;
}

export default teamBasicInfo;