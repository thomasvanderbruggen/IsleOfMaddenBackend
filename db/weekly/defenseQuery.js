import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';



/*
    Inserts stats into defensive_stats table
*/
export const defenseQuery = async (stat) => {
    let con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `INSERT INTO defensive_stats (defCatchAllowed, defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs,
                 defTotalTackles, fullName, rosterId, playerId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) 
            ON DUPLICATE KEY UPDATE defCatchAllowed=VALUES(defCatchAllowed), defDeflections=VALUES(defDeflections), defForcedFum=VALUES(defForcedFum), 
            defFumRec=VALUES(defFumRec), defInts=VALUES(defInts), defIntReturnYds=VALUES(defIntReturnYds), defPts=VALUES(defPts), defSacks=VALUES(defSacks), 
            defSafeties=VALUES(defSafeties), defTDs=VALUES(defTDs), defTotalTackles=VALUES(defTotalTackles), scheduleId=VALUES(scheduleId), seasonIndex=VALUES(seasonIndex), 
            stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`,
             [stat.defCatchAllowed, stat.defDeflections, stat.defForcedFum, stat.defFumRec, stat.defInts, stat.defIntReturnYds, stat.defPts, stat.defSacks, stat.defSafeties, stat.defTDs,
            stat.defTotalTackles, stat.fullName, stat.rosterId, stat.playerId, stat.scheduleId, stat.seasonIndex, stat.statId, stat.stageIndex, stat.teamId, stat.weekIndex])
        
        con.end();
        return true;

    }catch (err){
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default defenseQuery;