import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

/*
    Retrieves top 10 players with most tackles in the league
*/


export const tackleLeadersQuery = async (seasonIndex) => {
    const con = await mysql.createConnection(dbConfig);

    try {
        let [rows, fields] = await con.query(
            `SELECT 
                fullName,
                SUM(defTotalTackles) 'defTotalTackles',
                SUM(defForcedFum) 'defForcedFum',
                SUM(defSacks) 'defSacks'
            FROM
                defensive_stats
            WHERE
                seasonIndex = ?
            GROUP BY playerId
            ORDER BY SUM(defTotalTackles) DESC , SUM(defForcedFum) DESC
            LIMIT 10;
            `, [seasonIndex])
        con.end();
        return rows;
    }catch (err) {
        console.log(err); 
        con.end();
        return false;
    }
}