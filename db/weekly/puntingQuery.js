import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';



/* 
    Inserts stats into the punting_stats table 
*/
export const puntingQuery = async (game) => {
    let con = await mysql.createConnection(dbConfig); 
    console.log('in punting query');
    try {
        let [rows, fields] = await con.query(
            `INSERT INTO punting_stats (fullName, puntsBlocked, puntsIn20, puntLongest, puntTBs, puntNetYdsPerAtt, 
                puntNetYds, puntAtt, rosterId, playerId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), puntsBlocked=VALUES(puntsBlocked), puntsIn20=VALUES(puntsIn20), puntLongest=VALUES(puntLongest), puntTBs=VALUES(puntTBs), puntNetYdsPerAtt=VALUES(puntNetYdsPerAtt), 
            puntNetYds=VALUES(puntNetYds), rosterId=VALUES(rosterId), scheduleId=VALUES(scheduleId), seasonIndex=VALUES(seasonIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`, 
            [game.fullName, game.puntsBlocked, game.puntsIn20, game.puntLongest, game.puntTBs,game.puntNetYdsPerAtt, game.puntNetYds, game.puntAtt, game.rosterId, game.playerId, game.scheduleId, game.seasonIndex, game.statId, game.stageIndex, game.teamId, game.weekIndex])
    
        con.end();
        return true;
    }catch (err){
        console.log(err);
        con.end(); 
        return false;
    }
}

export default puntingQuery;