import mysql from 'mysql2/promise'; 
import utils from '../../utils';

export const allIds = async (team) => {
    const con = await mysql.createConnection(utils.dbConfig); 
    
    
    try { 
        let test = await con.query('select playerId from players where teamId = ? and isRetired = 0', [team]);
        let [rows, fields] = test;
        let ids = rows.map(row => row.playerId); 
        console.log(ids); 
        return ids; 
    }catch (err){
        console.log(err); 
        return false; 
    }
     

    
}

export default allIds;