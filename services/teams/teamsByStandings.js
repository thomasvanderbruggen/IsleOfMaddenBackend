import teamsByStandingsQuery from '../../db/teams/teamsByStandingsQuery'
import mysql from 'mysql2';
import { dbConfig } from '../../utils';

// Runs the query for each team sent by the API
export const teamsByStandings = async (teams) => {
    const pool = mysql.createPool(dbConfig);
    const promisePool = pool.promise();  
    let counter = 0; 
    for (const team of teams) { 
        let success = await teamsByStandingsQuery(team, promisePool); 
        console.log(success);
        if (!success){
            return false;
        }
        counter++; 
    }
    return true;
}

export default teamsByStandings;