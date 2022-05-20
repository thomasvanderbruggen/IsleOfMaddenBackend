import mysql from 'mysql2/promise'
import { dbConfig } from '../../utils'


/*
    Retrieves kicking and kickoff stats for the given Kicker
*/
export const kickingStatsQuery = async (playerId, seasonIndex) => {
    const con = mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT
            k.kickPts, 
            k.fGAtt, 
            k.fG50PlusAtt, 
            k.fG50PlusMade, 
            k.fGLongest, 
            k.fGMade, 
            k.kickoffAtt, 
            k.kickoffTBs, 
            k.xPAtt, 
            k.xPMade, 
            k.xPCompPct, 
            k.fullName, 
            k.weekIndex, 
            k.teamId, 
            sch.awayTeamId, 
            sch.homeTeamId 
            FROM 
                kicking_stats k
                LEFT JOIN schedules sch ON sch.scheduleId = k.scheduleId AND sch.weekIndex = k.weekIndex
            WHERE
                k.playerId = ? AND
                k.seasonIndex = ? AND 
                k.weekIndex < 24
            `,  [playerId, seasonIndex]); 
        con.end()
        return rows;
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
}

export default kickingStatsQuery;