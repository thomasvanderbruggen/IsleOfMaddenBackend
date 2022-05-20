import mysql from 'mysql2/promise';
import { dbConfig } from '../../utils';


/*
    Gets the full, active roster for the given team
*/

export const teamRosterQuery = async (teamId) => {
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                firstName,
                lastName,
                position,
                devTrait,
                age,
                height,
                weight,
                playerBestOvr,
                speedRating,
                awareRating
             FROM players
             WHERE teamId = ? and isRetired = false
            `, [teamId])
        
        con.end();
        return rows;
    }catch (err){
        console.log(err);
        con.end();
        return false;
    }
}