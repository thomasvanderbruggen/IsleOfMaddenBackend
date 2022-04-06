import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

export const passingQuery = async (stat) => {
    let con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = con.query(
            `INSERT INTO passing_stats (fullName, passAtt, passComp, passCompPct, passInts, passLongest, passPts, passerRating, passSacks, 
                passTDs, passYds, passYdsPerAtt, passYdsPerGame, rosterid, playerId, 
                scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), passAtt=VALUES(passAtt), passComp=VALUES(passComp), passInts=VALUES(passInts), passLongest=VALUES(passLongest), passPts=VALUES(passPts), passerRating=VALUES(passerRating), passSacks=VALUES(passSacks), passTDs=VALUES(passTDs), passYds=VALUES(passYds), passYdsPerAtt=VALUES(passYdsPerAtt), passYdsPerGame=VALUES(passYdsPerGame), rosterId=VALUES(rosterId), scheduleId=VALUES(scheduleId),
                seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)
            `, [stat.fullName, stat.passAtt, stat.passComp, stat.passCompPct, stat.passInts, stat.passLongest, stat.passPts, stat.passerRating, 
                stat.passSacks, stat.passTDs, stat.passYds, stat.passYdsPerAtt, stat.passYdsPerGame, 
                stat.rosterId, stat.playerId, stat.scheduleId, stat.seasonIndex, stat.statId, stat.stageIndex, stat.teamId, stat.weekIndex])
        
        con.end(); 
        return true;

    } catch (err) {
        console.log(err); 
        con.end();
        return false; 
    }

}

export default passingQuery;