import mysql from 'mysql2/promise';
import { dbConfig } from '../../utils';


/*
    Retrieves the top 10 Field Goal Kickers in the league
*/
export const fgLeadersQuery = async (seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT 
                fullName,
                SUM(fGMade) 'fgMade',
                SUM(fGAtt) 'fgAtt',
                SUM(xpMade) 'xpMade'
            FROM
                kicking_stats
            WHERE
                seasonIndex = ?
            GROUP BY playerId
            ORDER BY SUM(fGMade) DESC , SUM(fgAtt) ASC
            LIMIT 10;
            `, [seasonIndex]); 
        con.end();
        return rows; 
    }catch (err){
        console.log(err);
        con.end();
        return false;
    }
}

export default fgLeadersQuery; 