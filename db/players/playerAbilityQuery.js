import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Retrieves SuperStar/X-Factor Abilities for the given player
*/
export const playerAbilityQuery = async (playerId) => {
    const con = mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT abilityTitle, abilityDescription from player_ablities where playerId = ?
            `, [playerId])
        con.end(); 

        return rows; 
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
}

export default playerAbilityQuery; 