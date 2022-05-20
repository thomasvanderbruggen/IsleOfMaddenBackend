import mysql from 'mysql2/promise'; 
import utils from '../../utils';


/*
    Inserts and updates the team_stats table 
*/
export const teamWeeklyStatsQuery = async (stat, pool) => {

    try { 
        let [rows, fields] = await pool.query(
            `INSERT INTO team_stats (defForcedFum, defFumRec, defIntsRec, defPtsPerGame, defPassYds, defRushYds,
                defRedZoneFGs, defRedZones, defRedZonePct, defRedZoneTDs, defSacks, defTotalYds, off4thDownAtt, off4thDownConv,
                off4thDownConvPct, offFumLost, offIntsLost, off1stDowns, offPtsPerGame, offPassTDs, offPassYds, offRushTDs, offRushYds,
                offRedZoneFGs, offRedZones, offRedZonePct, offRedZoneTDs, offSacks, off3rdDownAtt, off3rdDownConv, off3rdDownConvPct,
                off2PtAtt, off2PtConv, off2PtConvPct, offTotalYds, offTotalYdsGained, penalties, penaltyYds, scheduleId, seed, seasonIndex,
                statId, stageIndex, totalLosses, teamId, tODiff, tOGiveaways, tOTakeaways, totalTies, totalWins, weekIndex)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON DUPLICATE KEY UPDATE defForcedFum=VALUES(defForcedFum), defFumRec=VALUES(defFumRec), defIntsRec=VALUES(defIntsRec), 
                defPtsPerGame=VALUES(defPtsPerGame), defPassYds=VALUES(defPassYds), defRushYds=VALUES(defRushYds), defRedZoneFGs=VALUES(defRedZoneFGs), defRedZones=VALUES(defRedZones), defRedZonePct=VALUES(defRedZonePct),
                defRedZoneTDs=VALUES(defRedZoneTDs), defSacks=VALUES(defSacks), defTotalYds=VALUES(defTotalYds), off4thDownAtt=VALUES(off4thDownAtt), off4thDownConv=VALUeS(off4thDownConv), off4thDownConvPct=VALUES(off4thDownConvPct), 
                offFumLost=VALUES(offFumLost), offIntsLost=VALUES(ofFIntsLost), off1stDowns=VALUES(off1stDowns), offPtsPerGame=VALUES(offPtsPerGame), offPassTDs=VALUES(offPassTDs), offPassYds=VALUES(offPassYds), offRushTDs=VALUES(ofFRushTDs),
                offRushYds=VALUES(offRushYds), offRedZoneFGs=VALUES(offRedZoneFGs), offRedZones=VALUES(ofFRedZones), offRedZonePct=VALUES(offRedZonePct), offRedZoneTDs=VALUES(offRedZoneTDs), offSacks=VALUES(offSacks), 
                off3rdDownAtt=VALUES(off3rdDownAtt), off3rdDownConv=VALUES(off3rdDownConv), off3rdDownConvPct=VALUES(off3rdDownConvPct), off2PtAtt=VALUES(off2PtAtt), off2PtConv=VALUES(off2PtConv), off2PtConvPct=VALUES(off2PtConvPct),
                offTotalYds=VALUES(offTotalYds), offTotalYdsGained=VALUES(offTotalYdsGained), penalties=VALUES(penalties), penaltyYds=VALUES(penaltyYds), seasonIndex=VALUES(seasonIndex), scheduleId=VALUES(scheduleId), totalLosses=VALUES(totalLosses), tODiff=VALUES(tODiff),
                tOGiveaways=VALUES(tOGiveaways), tOTakeaways=VALUES(tOTakeaways), totalTies=VALUES(totalTies), totalWins=VALUES(totalWins), weekIndex=VALUES(weekIndex), teamId=VALUES(teamId)
            `, [stat.defForcedFum,stat.defFumRec,stat.defIntsRec,stat.defPtsPerGame,stat.defPassYds,stat.defRushYds,stat.defRedZoneFGs,stat.defRedZones,stat.defRedZonePct,
                stat.defRedZoneTDs,stat.defSacks,stat.defTotalYds,stat.off4thDownAtt,stat.off4thDownConv,stat.off4thDownConvPct,stat.offFumLost,stat.offIntsLost,stat.off1stDowns,
                stat.PtsPerGame,stat.offPassTDs,stat.offPassYds,stat.offRushTDs,stat.offRushYds,stat.offRedZoneFGs,stat.offRedZones,stat.offRedZOnePct,stat.offRedZoneTDs,stat.offSacks,stat.off3rdDownAtt,
                stat.off3rdDownConv,stat.off3rdDownConvPct,stat.off2PtAtt,stat.off2PtConv,stat.off2PtConvPct,stat.offTotalYds,stat.offTotalYdsGained,stat.penalties,stat.penaltyYds,stat.scheduleId, stat.seed,stat.seasonIndex,
                stat.statId,stat.stageIndex,stat.totalLosses,stat.teamId,stat.tODiff,stat.tOGiveaways,stat.tOTakeaways,stat.totalTies,stat.totalWins,stat.weekIndex]);
        
        return true;
    }catch (err) {
        console.log(err);
        con.end(); 
        return false;
    }
     
}

export default teamWeeklyStatsQuery;