import mysql from 'mysql2/promise'; 
import utils from '../../utils';

export const handleRetirees = async (ids, pool) => {
    let sql = 'UPDATE players SET isRetired = true where playerId in (' + ids.toString() + ')'; 

    try {
        let [rows, fields] = await pool.query(sql);
        
        return true;
    } catch (err) {
        console.log(err); 
        return false; 
    }
} 

export default handleRetirees;
