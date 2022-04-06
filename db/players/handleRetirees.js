import mysql from 'mysql2/promise'; 
import utils from '../../utils';

export const handleRetirees = async (ids) => {
    let sql = 'UPDATE players SET isRetired = true where playerId in (' + ids.toString() + ')'; 
    let con = await mysql.createConnection(utils.dbConfig); 

    try {
        let [rows, fields] = await con.query(sql);
        
        return true;
    } catch (err) {
        console.log(err); 
        return false; 
    }
} 

export default handleRetirees;
