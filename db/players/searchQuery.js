import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

export const searchQuery = async (sql, values) => { 
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(sql, values);
        con.end(); 
        return rows; 
    }catch(err) {
        console.log(err); 
        con.end(); 
        return false; 
    }
}