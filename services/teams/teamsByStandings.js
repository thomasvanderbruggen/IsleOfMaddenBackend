import teamsByStandingsQuery from '../../db/teams/teamsByStandingsQuery'
import mysql from 'mysql2/promise';
import { dbConfig } from '../../utils';

// Runs the query for each team sent by the API
export const teamsByStandings = async (teams) => {
    const pool = mysql.createPool(dbConfig).promise(); 

    for (const team of teams) { 
        let success = teamsByStandingsQuery(team, pool); 
        if (!success){
            return false;
        }
    }
    return true;
}

export default teamsByStandings;