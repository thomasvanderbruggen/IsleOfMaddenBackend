import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Retrieves the current standings of the league
*/
export const teamRankQuery = async (seasonIndex) => {
    const con = await mysql.createConnection(dbConfig);     
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                ts.totalWins,
                ts.totalLosses,
                ts.totalTies,
                ts.teamId,
                t.teamName,
                ROW_NUMBER() OVER (ORDER BY totalWins DESC, totalLosses ASC, confWins DESC, divWins DESC) as "place" 
            FROM
                team_season_stats ts
                LEFT JOIN teams_temp t ON t.teamId = ts.teamId
            WHERE
                seasonIndex = ?
            ORDER BY totalWins DESC , totalTies DESC , totalLosses DESC; 
            `, [seasonIndex])
        con.end();
        return rows;
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
}