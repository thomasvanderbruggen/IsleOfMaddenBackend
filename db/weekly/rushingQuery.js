import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Inserts stats into the rushing_stats table
*/ 
export const rushingQuery = async (stat) => {
    let con = await mysql.createConnection(dbConfig); 

    try { 
        let [rows, fields] = await con.query(
            `INSERT INTO rushing_stats (fullName, rushAtt, rushBrokenTackles, rushFum, rushLongest, rushPts, rosterId, playerId, rushTDs, 
                rushToPct, rush20PlusYds, rushYdsAfterContact, rushYds, rushYdsPerAtt, rushYdsPerGame, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), rushAtt=VALUES(rushAtt), rushBrokenTackles=VALUES(rushBrokenTackles), rushFum=VALUES(rushFum), 
            rushLongest=VALUES(rushLongest), rushPts=VALUES(rushPts), rosterId=VALUES(rosterId), rushTDs=VALUES(rushTDs), rushToPct=VALUES(rushToPct), 
            rush20PlusYds=VALUES(rush20PlusYds), rushYdsAfterContact=VALUES(rushYdsAfterContact), rushYds=VALUES(rushYds), rushYdsPerAtt=VALUES(rushYdsPerAtt), 
            rushYdsPerGame=VALUES(rushYdsPerGame), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex)`
            ,[stat.fullName,stat.rushAtt, stat.rushBrokenTackles,stat.rushFum,stat.rushLongest,stat.rushPts,stat.rosterId,stat.playerId,stat.rushTDs,stat.rushToPct,stat.rush20PlusYds,
                stat.rushYdsAfterContact,stat.rushYds,stat.rushYdsPerAtt,stat.rushYdsPerGame,stat.scheduleId,stat.seasonIndex,stat.statId,stat.stageIndex,stat.teamId,stat.weekIndex])

        con.end();
        return true;
    }catch (err){
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default rushingQuery;