import teamBasicInfoQuery from "../../db/teams/teamBasicInfoQuery"
import mysql from 'mysql2'
import { dbConfig } from "../../utils";


//For each team in the json object, insert/update the database
export const teamBasicInfo = async (teams, pool) => {
    for (const team of teams) { 
        let success = teamBasicInfoQuery(team, pool);
        if (!success){
            return false;
        } 
    }
    
    return true;
}

export default teamBasicInfo;