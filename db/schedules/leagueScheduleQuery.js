import mysql from 'mysql2/promise'; 
import { dbConfig,  getCalendarYearFromIndex} from '../../utils';



/*
  Retrieves all of the league's games for a certain week as indicated by weekIndex.  
*/
export const leagueScheduleQuery = async (seasonIndex, weekIndex) => {
    const con = await mysql.createConnection(dbConfig); 
    console.log(`${seasonIndex} SI`); 
    console.log(`${weekIndex} WI`); 
    try {
      let [rows, fields] = await con.query(
        `SELECT
         sch.homeTeamId,
         sch.homeScore, 
         sch.awayTeamId, 
         sch.awayScore, 
         sch.weekIndex, 
         sch.weekStatus, 
         sch.seasonIndex, 
         awayTeam.teamName as awayTeam,
         homeTeam.teamName as homeTeam
        FROM schedules sch
         LEFT JOIN 
          (SELECT teamName, teamId
           FROM teams_temp) awayTeam ON awayTeam.teamId = sch.awayTeamId
         LEFT JOIN 
          (SELECT teamName, teamId
           FROM teams_temp) homeTeam ON homeTeam.teamId = sch.homeTeamId
        WHERE sch.seasonIndex = ? and sch.weekIndex = ? 
        ORDER BY weekStatus DESC
        `, [seasonIndex, weekIndex])
    let calendarYear = getCalendarYearFromIndex(rows[0].seasonIndex); 

    con.end();

    return { 
      games: rows, 
      weekIndex, 
      seasonIndex, 
      calendarYear
    }
  }catch (err) {
    console.log(err);
    con.end(); 
    return false; 
  }
    
    
}