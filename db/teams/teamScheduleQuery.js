import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

/*
    Gets the full schedule of the given team
*/

export const teamScheduleQuery = async (teamId, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig);
    try {
        const [rows, fields] = await con.query(`
        SELECT
          sch.scheduleId,
          sch.homeScore,
          sch.homeTeamId,
          sch.awayScore,
          sch.awayTeamId,
          sch.weekIndex,
          sch.weekStatus,
          t1.teamName as homeTeam,
          t2.teamName as awayTeam
        FROM 
         schedules sch 
         LEFT JOIN (
             SELECT teamName, teamId
             FROM teams_temp
         )t1 on t1.teamId = sch.homeTeamID
         LEFT JOIN (
             SELECT teamName, teamId
             FROM teams_temp
         )t2 on t2.teamId = sch.awayTeamId
        WHERE (sch.homeTeamId = ? or sch.awayTeamId = ?) and seasonIndex = ? and weekIndex < 23 
        ORDER BY weekIndex asc
         `, [teamId, teamId, seasonIndex])
        con.end(); 
        return rows;
    } catch (err) {
        console.log(err);
        con.end();
        return false;
    }
    
}