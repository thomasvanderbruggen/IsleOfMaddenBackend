import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Retrieves top 10 players with most interceptions in the league
*/

export const intLeadersQuery = async (seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT 
                fullName,
                SUM(defInts) 'defInts',
                SUM(defDeflections) 'defDeflections',
                SUM(defCatchAllowed) 'defCatchAllowed',
                SUM(defTDs) 'defTDs'
            FROM
                defensive_stats
            WHERE
                seasonIndex = ?
            GROUP BY playerId
            ORDER BY SUM(defInts) DESC , SUM(defDeflections) DESC , SUM(defCatchAllowed) ASC
            LIMIT 10;
            `, [seasonIndex])
        con.end(); 
        return rows;
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
}
export default intLeadersQuery; 