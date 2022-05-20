import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Gets rushing and receiving stats for the given Running Back 
*/
export const rbStatsQuery = async (playerId, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT 
                ru.fullName,
                ru.rushAtt, 
                ru.rushBrokenTackles, 
                ru.rushFum, 
                ru.rushLongest, 
                ru.rushPts, 
                ru.rushTDs, 
                ru.rushToPct, 
                ru.rush20PlusYds, 
                ru.rushYds, 
                ru.rushYdsPerAtt, 
                ru.rushYdsPerGame, 
                re.recCatches, 
                re.recCatchPct, 
                re.recDrops, 
                re.recLongest, 
                re.recPts, 
                re.recTDs, 
                re.recToPct, 
                re.recYds, 
                re.recYdsAfterCatch, 
                re.recYdsPerGame, 
                ru.weekIndex, 
                ru.teamId, 
                sch.homeTeamId, 
                sch.awayTeamId
            FROM 
                rushing_stats ru 
                LEFT JOIN receiving_stats re ON re.playerId = ru.playerId and re.weekIndex = ru.weekIndex and re.scheduleId = ru.scheduleId
                LEFT JOIN schedules sch ON sch.scheduleId = ru.scheduleId and sch.weekIndex = ru.weekIndex
            WHERE 
                ru.playerId = ? AND 
                ru.seasonIndex = ? AND
                ru.weekIndex < 24 
            `
        , [playerId, seasonIndex])
        con.end(); 
        return rows;
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
}

export default rbStatsQuery; 