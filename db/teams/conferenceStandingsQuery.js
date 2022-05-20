import mysql from 'mysql2/promise';
import { dbConfig } from '../../utils';


/*
    Retrieves the current standings of a given conference
*/
export const conferenceStandingsQuery = async (conferenceName, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 
    console.log(`conf name: ${conferenceName}`);
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                t.teamName,
                t.conferenceName,
                ts.totalWins,
                ts.totalLosses,
                ts.totalTies,
                ts.divWins,
                ts.divLosses,
                ts.divTies,
                ts.confTies,
                ts.confWins,
                ts.confLosses,
                ts.confTies,
                ts.winLossStreak,
                ROW_NUMBER() OVER (ORDER BY totalWins DESC, totalLosses ASC, confWins DESC, divWins DESC) as "place"
            FROM 
                teams_temp t
                LEFT JOIN team_season_stats ts ON ts.teamId = t.teamId
            WHERE
                t.conferenceName = ? AND
                ts.seasonIndex = ?
            `, [conferenceName, seasonIndex])
        con.end();
        return rows; 
    }catch (err) {
        console.log(err); 
        con.end();
        return false;
    }

}