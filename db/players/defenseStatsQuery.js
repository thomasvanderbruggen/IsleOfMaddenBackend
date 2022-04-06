import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

/*
    Retrieves defensive stats for the given defender
*/

export const defenseStatsQuery = async (playerId, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT 
                def.defCatchAllowed, 
                def.defDeflections, 
                def.defForcedFum, 
                def.defFumRec, 
                def.defInts, 
                def.defIntReturnYds, 
                def.defPts, 
                def.defSacks, 
                def.defSafeties, 
                def.defTDs, 
                def.defTotalTackles, 
                def.fullName, 
                def.weekIndex, 
                def.teamId, 
                sch.awayTeamId, 
                sch.homeTeamId
            FROM 
                defensive_stats def
                LEFT JOIN schedules sch on sch.scheduleId = def.scheduleId AND sch.weekIndex = def.weekIndex
            WHERE
                def.playerId = ? AND 
                def.seasonIndex =? AND 
                def.weekIndex < 24
            `
        , [playerId, seasonIndex]) 
    }catch (err){
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default defenseStatsQuery