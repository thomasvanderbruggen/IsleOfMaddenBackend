import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Retrieves punting and kickoff stats for the given Punter
*/
export const puntingStatsQuery = async (playerId, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                p.puntsBlocked, 
                p.puntsIn20, 
                p.puntLongest, 
                p.puntTBs, 
                p.puntNetYds, 
                p.puntAtt, 
                p.puntYds, 
                p.fullName, 
                k.kickoffAtt, 
                k.kickoffTBs, 
                p.weekIndex, 
                p.teamId, 
                sch.awayTeamId, 
                sch.homeTeamId
            FROM 
                punting_stats p
                LEFT JOIN kicking_stats k on k.scheduleId = p.scheduleId AND k.weekIndex = p.weekIndex AND k.playerId = p.playerId
                LEFT JOIN schedules sch on sch.scheduleId = p.scheduleId AND sch.weekIndex = p.weekIndex
            WHERE
                p.playerId = ? AND 
                p.seasonIndex = ? AND 
                p.weekIndex < 24
            `
        , [playerId, seasonIndex])
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
}

export default puntingStatsQuery; 