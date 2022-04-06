import mysql from 'mysql2/promise';
import { dbConfig } from '../../utils';


/*
    Gets the coach of the team
*/
export const teamByNameCoachQuery = async (teamName) => {
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `SELECT coachName
            FROM coaches
            WHERE teamName = ?
            `, [teamName]);
        con.end();
        return rows;
    }catch (err) {
        console.log(err);
        con.end();
        return false;
    }
    
}