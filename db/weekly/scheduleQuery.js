import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

export const scheduleQuery = async (game) => {
    let con = await mysql.createConnection(dbConfig); 

    try { 
        let [rows,fields] = await con.query(
        `INSERT INTO schedules (awayScore, awayTeamId, isGameOfTheWeek, homeScore, homeTeamId, scheduleId, seasonIndex, stageIndex, weekStatus, weekIndex) 
        VALUES (?,?,?,?,?,?,?,?,?,?)
        `, [game.awayScore, game.awayTeamId, game.isGameOfTheWeek, game.homeScore, game.homeTeamId, game.scheduleId, game.seasonIndex, game.stageIndex, game.weekStatus, game.weekIndex]); 
        
        con.end();
        return true;
    }catch (err){
        console.log(err);
        con.end()
        return false;
    }
    
}
export default scheduleQuery;