import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Retrieves receiving stats from the given Wide Receiver/Tight End
*/
export const wrStatsQuery = async (playerId, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                re.recCatches, 
                re.recCatchPct, 
                re.recDrops, 
                re.recLongest, 
                re.recPts, 
                re.recTDs, 
                re.recYdsAfterCatch, 
                re.recYacPerCatch, 
                re.recYds, 
                re.recYdsPerCatch, 
                re.recYdsPerGame, 
                re.fullName, 
                re.weekIndex, 
                re.teamId, 
                sch.awayTeamId, 
                sch.homeTeamId
            FROM 
                receiving_stats re 
                LEFT JOIN schedules sch on sch.scheduleId = re.scheduleId AND sch.weekIndex = re.weekIndex
            WHERE
                re.playerId = ? AND 
                re.seasonIndex = ? AND 
                re.weekIndex < 24
            `
        , [playerId, seasonIndex])
        con.end();
        return rows; 
    }catch (err) {
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default wrStatsQuery;