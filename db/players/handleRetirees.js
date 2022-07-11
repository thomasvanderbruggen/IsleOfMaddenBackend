import mysql from 'mysql2/promise'; 
import utils, { dbConfig } from '../../utils';

export const handleRetirees = async (ids) => {
    const con = await mysql.createConnection(utils.dbConfig)
    let sql = 'UPDATE players SET isRetired = true where playerId in (' + ids.toString() + ')'; 

    try {
        let [rows, fields] = await con.query(sql);
        
        return true;
    } catch (err) {
        console.log(err); 
        return false; 
    }
} 

export default handleRetirees;
