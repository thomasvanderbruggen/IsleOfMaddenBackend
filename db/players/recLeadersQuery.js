import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

/*
    Retrieves the top 10 Receivers/Tight Ends in the league
*/
export const recLeadersQuery = async (seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                fullName,
                SUM(recCatches) 'recCatches',
                SUM(recYds) 'recYds',
                SUM(recTDs) 'recTDs',
                MAX(recLongest) 'recLongest'
            FROM
                receiving_stats
            WHERE
                seasonIndex = ?
            GROUP BY playerId
            ORDER BY SUM(recYds) DESC , SUM(recTDs) DESC
            LIMIT 10; 
            `, [seasonIndex])
        con.end();
        return rows;
    }catch (err) {
        console.log(err);
        con.end()

    }
}