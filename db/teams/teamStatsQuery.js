import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
  Gets the basic stats for the given team from the current season
*/
export const teamStatsQuery = async (teamId, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `SELECT 
              offTotalYds,
              offPassYds,
              offRushYds,
              tOGiveaways,
              defTotalYds,
              defPassYds,
              defRushYds,
              tOTakeaways
            FROM 
              team_stats
            WHERE 
              teamId = ? AND
              weekIndex < 23 AND
              seasonIndex = ? 
            `, [teamId, seasonIndex])
        con.end();
        return rows;
    } catch (err) {
        console.log(err);
        con.end();
        return false;
    }
}