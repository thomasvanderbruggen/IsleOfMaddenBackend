import rostersQuery from "../../db/teams/rostersQuery";
import mysql from 'mysql2'; 
import { dbConfig } from "../../utils";

/*
    Runs the rosterQuery for each player on the roster
*/

export const roster = async (players) => {
    const pool = mysql.createPool({
        'host': dbConfig.host,
        'user': dbConfig.user,
        'database': dbConfig.database,
        'password': dbConfig.password, 
        'connectionLimit': 15
    })
    let success; 
    for (const player of players) {
        success = rostersQuery(player, pool);
        if (!success) {
            return false; 
        }    
    }

    if (success){
        return true;
    }

}

export default roster;