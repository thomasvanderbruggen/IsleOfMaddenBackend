import teamsByStandingsQuery from '../../db/teams/teamsByStandingsQuery'
import mysql from 'mysql2';
import { dbConfig } from '../../utils';

// Runs the query for each team sent by the API
export const teamsByStandings = async (teams, pool) => {
    let counter = 0; 
    for (const team of teams) { 
        let success = await teamsByStandingsQuery(team, pool); 
        console.log(success);
        if (!success){
            return false;
        }
        counter++; 
    }
    return true;
}

export default teamsByStandings;