import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

export const kickingQuery = async (stat) => {
    let con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `INSERT INTO kicking_stats (kickPts, fGAtt, fG50PlusAtt, fG50PlusMade, fGLongest, fGMade, 
                fGCompPct, fullName, kickoffAtt, kickoffTBs, rosterId, playerId, scheduleId, seasonIndex, 
                statId, stageIndex, teamId, weekIndex, xPAtt, xPMade, xPCompPct)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE kickPts=VALUES(kickPts), fGAtt=VALUES(fGAtt), fG50PlusAtt=VALUES(fG50PlusAtt), fG50PlusMade=VALUES(fG50PlusMade), 
            fGLongest=VALUES(fGLongest), fGMade=VALUES(fGMade), fGCompPct=VALUES(fGCompPct), kickoffAtt=VALUES(kickoffAtt), kickoffTBs=VALUES(kickoffTBs), 
            rosterId=VALUES(rosterId), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), weekIndex=VALUES(weekIndex), xPAtt=VALUES(xPAtt), 
            xPMade=VALUES(xPMade), xPCompPct=VALUES(xPCompPct)
            `, [stat.kickPts, stat.fGAtt, stat.fG50PlusAtt, stat.fG500PlusMade, stat.fGLongest, stat.fGMade, 
                stat.fGCompPct, stat.fullName, stat.kickoffAtt, stat.kickoffTBs, stat.rosterId, stat.playerId, stat.scheduleId, stat.seasonIndex, stat.statId, stat.stageIndex, stat.teamId, stat.weekindex, stat.xPAtt, stat.xPMade, stat.xPCompPct]); 
        
        con.end(); 
        return true;
    }catch (err){
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default kickingQuery;