import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

/*
    Inserts stats into the receiving_stats table
*/

export default receivingQuery = async (stat) => {
    let con = await mysql.createConnection(dbConfig); 

    try { 
        let [rows, fields] = await con.query(
            `INSERT INTO receiving_stats (fullName, recCatches, recCatchPct, recDrops, recLongest, recPts, rosterId, 
                playerId, recTDs, recToPct, recYdsAfterCatch, recYacPerCatch, recYds, recYdsPerCatch, recYdsPerGame, 
                scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), recCatches=VALUES(recCatches), recCatchPct=VALUES(recCatchPct), recDrops=VALUES(recDrops), 
            recLongest=VALUES(recLongest), recPts=VALUES(recPts), rosterId=VALUES(rosterId), recTDs=VALUES(recTDs), recToPct=VALUES(recToPct), 
            recYdsAfterCatch=VALUES(recYdsAfterCatch), recYacPerCatch=VALUES(recYacPerCatch), recYds=VALUES(recYds), recYdsPerCatch=VALUES(recYdsPerCatch), 
            recYdsPerGame=VALUES(recYdsPerGame), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`
            ,[stat.fullName,stat.recCatches, stat.recCatchPct,stat.recDrops,stat.recLongest,stat.recPts,stat.rosterId,stat.playerId,stat.recTDs,stat.recToPct,stat.recYdsAfterCatch,
                stat.recYacPerCatch,stat.recYds,stat.recYdsPerCatch,stat.recYdsPerGame,stat.scheduleId,stat.seasonIndex,stat.statId,stat.stageIndex,stat.teamId,stat.weekIndex])

        con.end();
        return true;
    }catch (err){
        console.log(err); 
        con.end(); 
        return false;
    }
}