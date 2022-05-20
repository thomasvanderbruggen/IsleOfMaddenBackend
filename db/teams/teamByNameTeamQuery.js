import mysql from 'mysql2/promise'
import { dbConfig } from '../../utils'



/*
    Gets the team's name, id, division, conference, and available cap space as well as their Win/Loss/Ties. 
*/
export const teamByNameTeamQuery = async (teamName, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 


    try {
        let [rows, fields] = await con.query(
            `SELECT 
              t.teamName,
              t.teamId,
              t.divisionName,
              t.conferenceName,
              t.cityName,
              ts.capAvailable,
              ts.teamOvr,
              ts.totalWins,
              ts.totalLosses,
              ts.totalTies
            FROM 
             teams_temp t
             LEFT JOIN team_season_stats ts on ts.teamId = t.teamId
            WHERE 
             t.teamName = ? and ts.seasonIndex = ? 
            `, [teamName, seasonIndex]); 
        con.end(); 
        if (rows.length === 0){
            throw new Error('No result from teamByNameQuery');
        }else if (rows.length > 1){
            throw new Error('Too many results from teamByNameQuery'); 
        }else {
            return rows; 
        }
    } catch (err) {
        console.log(err); 
        con.end(); 
        return false;
    }

    

}

export default teamByNameTeamQuery;