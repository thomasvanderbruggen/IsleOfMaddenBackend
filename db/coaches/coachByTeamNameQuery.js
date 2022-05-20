import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Selects the coachName from the coaches table (updated via the Discord bot by getting user's nicknames and matching with their team) for a given team team name 
*/
export const coachByTeamNameQuery = async (teamName) => {
    let con = await mysql.createConnection(dbConfig); 
    
    try {
        let [rows, fields] = await con.query(
        `SELECT coachName, teamName 
        FROM coaches 
        WHERE teamName = ? 
        `, [teamName])
        
        con.end();
        return rows; 


    }catch (err) {
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default coachByTeamNameQuery;