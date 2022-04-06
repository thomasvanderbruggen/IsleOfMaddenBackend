import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

/*
    Retrieves top 10 players with most forced fumbles in the league
*/
export const fumbleLeadersQuery = async(seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 
    try{ 
        let [rows, fields] = await con.query(
            `SELECT 
                fullName,
                SUM(defForcedFum) 'defForcedFum',
                SUM(defTotalTackles) 'defTackles',
                SUM(defFumRec) 'defFumRec',
                SUM(defInts) 'defInts'
            FROM
                defensive_stats
            WHERE
                seasonIndex = ?
            GROUP BY playerId
            ORDER BY SUM(defForcedFum) DESC , SUM(defTotalTackles) DESC
            LIMIT 10;
            `, [seasonIndex]);
        con.end();
        return rows; 
    }catch (err) {
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default fumbleLeadersQuery; 