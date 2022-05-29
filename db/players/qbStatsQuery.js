import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Retrieves passing and rushing stats for a given Quarterback
*/
export const qbStatsQuery = async (playerId, seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(`
        SELECT
            r.rushAtt,
            r.rushBrokenTackles,
            r.rushFum,
            r.rushLongest,
            r.rushPts,
            r.rushTDs,
            r.rushToPct,
            r.rush20PlusYds,
            r.rushYds,
            r.rushYdsPerAtt,
            r.rushYdsPerGame,
            p.passAtt,
            p.passComp,
            p.passCompPct,
            p.passInts,
            p.passLongest,
            p.passPts,
            p.passerRating,
            p.passSacks,
            p.passTDs,
            p.passYds,
            p.passYdsPerGame,
            p.fullName,
            p.playerId,
            p.weekIndex,
            r.teamId,
            sch.awayTeamId,
            sch.homeTeamId
        FROM 
            passing_stats p
            LEFT JOIN rushing_stats r on r.playerId = p.playerId and r.weekIndex = p.weekIndex and r.scheduleId = p.scheduleId
            LEFT JOIN schedules sch on sch.scheduleId = p.scheduleId and sch.weekIndex = p.weekIndex 
        WHERE
            p.playerId = ? AND 
            p.seasonIndex = ? AND 
            p.weekIndex < 24   
            `, [playerId, seasonIndex])
        con.end(); 
        console.log(rows); 
        return rows;
    }catch (err){
        console.log(err);
        con.end();
        return false;
    }
}

export default qbStatsQuery; 