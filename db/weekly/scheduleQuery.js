import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

export const scheduleQuery = async (game) => {
    let con = await mysql.createConnection(dbConfig); 
    console.log(game);
    try { 
        let [rows,fields] = await con.query(
        `INSERT INTO schedules (awayScore, awayTeamId, isGameOfTheWeek, homeScore, homeTeamId, scheduleId, seasonIndex, stageIndex, weekStatus, weekIndex) 
        VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE awayScore=VALUES(awayScore), awayTeamId=VALUES(awayTeamId), isGameOfTheWeek=VALUES(isGameOfTheWeek), homeScore=VALUES(homeScore), homeTeamId=VALUES(homeTeamId), seasonIndex=VALUES(seasonIndex), weekStatus=VALUES(weekStatus), weekIndex=VALUES(weekIndex)
        `, [game.awayScore, game.awayTeamId, game.isGameOfTheWeek, game.homeScore, game.homeTeamId, game.scheduleId, game.seasonIndex, game.stageIndex, game.status, game.weekIndex]); 
        
        con.end();
        return true;
    }catch (err){
        console.log(err);
        con.end()
        return false;
    }
    
}
export default scheduleQuery;