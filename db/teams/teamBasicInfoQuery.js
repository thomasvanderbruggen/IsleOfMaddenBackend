import utils from '../../utils';
import mysql from 'mysql2/promise'; 



/*
    Insert data from the leagueTeams POST route sent by the Madden Companion App
*/

export const teamBasicInfoQuery = async (team, pool) => {
    
    try {
        let [rows, fields] = pool.query(
            `insert into teams_temp (abbrName, cityName, displayName, nickName, primaryColor, secondaryColor, divisionName, teamId)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY
            UPDATE teamId=VALUES(teamId), abbrName=VALUES(abbrName), cityName=VALUES(cityName), displayName=VALUES(displayName), nickName=VALUES(nickName), primaryColor=VALUES(primaryColor), secondaryColor=VALUES(secondaryColor), divisionName=VALUES(divisionName)`
            ,[team.abbrName, team.cityName, team.displayName, team.nickName, team.primaryColor, team.secondaryColor, team.divName, team.teamId]);
        
        return true;
    }catch (err){
        console.log(err); 
        return false;
    }
}

export default teamBasicInfoQuery;