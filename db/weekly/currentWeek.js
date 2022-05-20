import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';



/*
    Gets the current week of the league.
*/
export const currentWeek = async () => {
    const con = await mysql.createConnection(dbConfig); 
    let [rows, fields] = await con.query(
        `SELECT seasonIndex, weekIndex 
        FROM schedules 
        WHERE weekStatus = 1 
        ORDER BY seasonIndex DESC, weekIndex ASC LIMIT 1
        `)
    
    if (rows.length === 1) {
        return [rows[0].seasonIndex, rows[0].weekIndex]; 
    }else{
        let [newRows, newFields] = await con.query(
            `SELECT seasonIndex, weekIndex
            FROM schedules WHERE weekIndex < 24
            ORDER BY seasonIndex DESC, weekIndex DESC limit 1
            `)
        con.end();
        return [newRows[0].seasonIndex, newRows[0].weekIndex]; 
    }

    
}


export default currentWeek;