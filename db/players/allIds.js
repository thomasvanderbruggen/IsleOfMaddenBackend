import mysql from 'mysql2/promise'; 
import utils from '../../utils';

export const allIds = async (team) => {
    const con = await mysql.createConnection(utils.dbConfig); 
    
    
    try { 
        let [rows, fields] = await con.query('select playerId from players where teamId = ?', [team]);
        let ids = rows.map(row => row.playerId); 

        return ids; 
    }catch (err){
        console.log(err); 
        return false; 
    }
     

    
}

export default allIds;