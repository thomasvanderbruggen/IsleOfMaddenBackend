import teamBasicInfoQuery from "../../db/teams/teamBasicInfoQuery"
import mysql from 'mysql2/promise'
import { dbConfig } from "../../utils";


//For each team in the json object, insert/update the database
export const teamBasicInfo = async (teams) => {
    const con = await mysql.createConnection(dbConfig);
    const pool = mysql.createPool(dbConfig).promise(); 
    for (const team of teams) { 
        let success = await teamBasicInfoQuery(team, pool);
        if (!success){
            return false;
        } 
    }
    return true;
}

export default teamBasicInfo;