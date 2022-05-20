import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

export const teamIdQuery = async () => {
    const con = await mysql.createConnection(dbConfig);
    try {
        const [rows, fields] = await con.query(
            `SELECT teamId, teamName
             FROM teams_temp
            `) 
        con.end()
        return rows; 
    }catch (err) {
        console.log(err);
        con.end();
        return false;
    }
    
    
}