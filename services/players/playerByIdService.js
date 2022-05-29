import playerByIdInfoQuery from "../../db/players/playerByIdInfoQuery";
import qbStatsQuery from "../../db/players/qbStatsQuery";
import rbStatsQuery from "../../db/players/rbStatsQuery";
import defenseStatsQuery from "../../db/players/defenseStatsQuery";
import kickingStatsQuery from "../../db/players/kickingStatsQuery";
import puntingStatsQuery from "../../db/players/puntingStatsQuery";
import playerAbilityQuery from "../../db/players/playerAbilityQuery";
import wrStatsQuery from "../../db/players/wrStatsQuery";


/*
    Gathers all of the information about a player from the given season. Depending on the position the player plays, the stats will be different
*/

export const playerByIdService = async (playerId, seasonIndex, teamIdToName) => {
    let playerInfo = await playerByIdInfoQuery(playerId, seasonIndex); 
    let seasonStats = {}; 
    let weeklyStats = []; 
    let abilities = {}; 
    console.log(`${seasonIndex} SI ${playerId} playerId`); 

    if (playerInfo?.position === "QB"){
        weeklyStats = await qbStatsQuery(playerId, seasonIndex);
        if (weeklyStats.length !== 0){
            seasonStats = {
                "name": '', 
                "rushAttempts": 0, 
                "rushBTackles": 0, 
                "fumbles": 0, 
                "rushLongest": 0, 
                "rushPts": 0, 
                "rushTDs": 0, 
                "rushOver20": 0, 
                "rushYds": 0, 
                "rushYdsPerAtt": 0, 
                "rushYdsPerGame": 0, 
                "passAttempts": 0, 
                "passCompletions": 0, 
                "passCompPct": 0, 
                "ints": 0, 
                "passLongest": 0, 
                "passPts": 0, 
                "passerRating": 0, 
                "passSacks": 0, 
                "passTDs": 0, 
                "passYds": 0, 
                "passYdsPerGame": 0,
                "passYdsPerAtt": 0
            }
            for (const week of weeklyStats) {
                seasonStats.name = week.fullName;
                seasonStats.rushAttempts += week.rushAtt; 
                seasonStats.rushBTackles += week.rushBrokenTackles; 
                seasonStats.fumbles += week.rushFum;
                if (week.rushLongest > seasonStats.rushLongest) seasonStats.rushLongest = week.rushLongest; 
                seasonStats.rushPts += week.rushPts; 
                seasonStats.rushTDs += week.rushTDs; 
                seasonStats.rushYdsPerGame = week.rushYdsPerGame; 
                seasonStats.passAttempts += week.passAtt; 
                seasonStats.passCompletions += week.passComp; 
                seasonStats.ints += week.passInts; 
                if (week.passLongest > seasonStats.passLongest) seasonStats.passLongest = week.passLongest; 
                seasonStats.passPts += week.passPts; 
                seasonStats.passSacks += week.passSacks;
                seasonStats.passTDs += week.passTDs; 
                seasonStats.passYds += week.passYds; 
                seasonStats.passYdsPerGame = week.passYdsPerGame;
                week.passerRating = +week.passerRating.toFixed(2);
                if (week.awayTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.homeTeamId];
                }
                if (week.homeTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.awayTeamId];
                }
                delete week.awayTeamId; 
                delete week.homeTeamId; 
            }
            seasonStats.rushYdsPerAtt = seasonStats.rushYds / seasonStats.rushAttempts; 
            seasonStats.passCompPct = (seasonStats.passCompletions / seasonStats.passAttempts) * 100;
            seasonStats.passYdsPerAtt = seasonStats.passYds / seasonStats.passAttempts;  
        }
        
    }else if (playerInfo?.position === "HB" || playerInfo?.position === "FB"){
        weeklyStats = await rbStatsQuery(playerId, seasonIndex); 
        if (weeklyStats.length !== 0){
            seasonStats = { 
                "name": '',
                "rushAttempts": 0, 
                "rushBrokenTackles": 0, 
                "fumbles": 0, 
                "rushLongest": 0, 
                "rushPts": 0, 
                "rushTDs": 0, 
                "rushToPct": 0, 
                "rush20PlusYds": 0, 
                "rushYds": 0, 
                "rushYdsPerAtt": 0, 
                "rushYdsPerGame": 0, 
                "recCatches": 0, 
                "recDrops": 0, 
                "recLongest": 0, 
                "recPts": 0, 
                "recTDs": 0, 
                "recYds": 0,
                "recYdsAfterCatch": 0, 
                "recYdsPerGame": 0, 
                "recYdsPerCatch": 0
            } 
            for (const week of weeklyStats){ 
                seasonStats.name = week.fullName;
                seasonStats.rushAttempts += week.rushAtt; 
                seasonStats.rushBrokenTackles += week.rushBrokenTackles; 
                seasonStats.fumbles += week.rushFum; 
                if (seasonStats.rushLongest < week.rushLongest) seasonStats.rushLongest = week.rushLongest; 
                seasonStats.rushPts += week.rushPts
                seasonStats.rushTDs += week.rushTDs; 
                seasonStats.rush20PlusYds += week.rush20PlusYds; 
                seasonStats.rushYds += week.rushYds; 
                seasonStats.rushYdsPerGame = week.rushYdsPerGame; 
                seasonStats.recCatches += week.recCatches; 
                seasonStats.recDrops += week.recDrops; 
                if (seasonStats.recLongest < week.recLongest) seasonStats.recLongest = week.recLongest; 
                seasonStats.recPts += week.recPts; 
                seasonStats.recTDs += week.recTDs; 
                seasonStats.recYds += week.recYds;
                seasonStats.recYdsAfterCatch += week.recYdsAfterCatch; 
                seasonStats.recYdsPerGame = week.recYdsPerGame;
                if (week.awayTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.homeTeamId];
                }
                if (week.homeTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.awayTeamId];
                }
                delete week.awayTeamId; 
                delete week.homeTeamId;
        
            }
            seasonStats.rushToPct = seasonStats.fumbles / seasonStats.rushAttempts; 
            seasonStats.rushYdsPerAtt = seasonStats.rushYds / seasonStats.rushAttempts; 
            if (seasonStats.recCatches > 0){
                seasonStats.recYdsPerCatch = seasonStats.recYds / seasonStats.recCatches; 
            }
        }
    }else if (playerInfo?.position === "WR" || playerInfo?.position === "TE"){
        weeklyStats = await wrStatsQuery(playerId, seasonIndex); 
        seasonStats = { 
            "name": '',
            "recCatches": 0,
            "recCatchPct": 0, 
            "recDrops": 0, 
            "recLongest": 0, 
            "recPts": 0, 
            "recTDs": 0, 
            "recYdsAfterCatch": 0, 
            "recYac": 0, 
            "recYds": 0, 
            "recYdsPerCatch": 0, 
            "recYdsPerGame": 0
        }
        console.log(weeklyStats);
        if (weeklyStats.length !== 0){
            for (const week of weeklyStats){
                seasonStats.name = week.fullName;
                seasonStats.recCatches += week.recCatches; 
                seasonStats.recDrops += week.recDrops; 
                if (week.recLongest > seasonStats.recLongest) seasonStats.recLongest = week.recLongest; 
                seasonStats.recPts += week.recPts;
                seasonStats.recTDs += week.recTDs; 
                seasonStats.recYdsAfterCatch += week.recYdsAfterCatch; 
                seasonStats.recYac += (week.recYacPerCatch * week.recCatches); 
                seasonStats.recYds += week.recYds;
                if (week.awayTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.homeTeamId];
                }
                if (week.homeTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.awayTeamId];
                }
                delete week.awayTeamId; 
                delete week.homeTeamId;
            }
            seasonStats.recYdsPerGame = weeklyStats[0].recYdsPerGame; 
            seasonStats.recYdsPerCatch = seasonStats.recYds / seasonStats.recCatches; 

        }
    }else if (playerInfo?.position === "P"){
        weeklyStats = await puntingStatsQuery(playerId, seasonIndex); 
        if (weeklyStats.length !== 0){
            seasonStats = { 
                "name": '',
                "puntsBlocked": 0, 
                "puntsIn20": 0, 
                "puntLongest": 0, 
                "puntTBs": 0, 
                "puntNetYdsPerAtt": 0, 
                "puntNetYds": 0, 
                "puntAtt": 0, 
                "puntYdsPerAtt": 0, 
                "puntYds": 0, 
                "kickoffAtt": 0, 
                "kickoffTBs": 0
            }
            for (const week of weeklyStats) {
                seasonStats.puntsBlocked += week.puntsBlocked; 
                seasonStats.puntsIn20 += week.puntsIn20; 
                seasonStats.puntLongest += week.puntLongest; 
                seasonStats.puntTBs += week.puntTBs; 
                seasonStats.puntNetYds += week.puntNetYds;
                seasonStats.puntAtt += week.puntAtt;  
                seasonStats.puntYds += week.puntYds; 
                seasonStats.kickoffAtt += week.kickoffAtt; 
                seasonStats.kickoffTBs += week.kickoffTBs;
                if (week.awayTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.homeTeamId];
                }
                if (week.homeTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.awayTeamId];
                }
                delete week.awayTeamId; 
                delete week.homeTeamId;
            }
            seasonStats.puntNetYdsPerAtt = seasonStats.puntNetYds / seasonStats.puntAtt; 
            seasonStats.puntYdsPerAtt = seasonStats.puntYds / seasonStats.puntAtt; 
            seasonStats.name = weeklyStats[0].fullName;
            response.seasonStats = seasonStats; 
            response.weeklyStats = weeklyStats; 
        }
    }else if (playerInfo?.position === "K"){
        weeklyStats = await kickingStatsQuery(playerId, seasonIndex); 
        if (weeklyStats.length !== 0){
            let seasonStats = { 
                "name": 0,
                "kickPts": 0, 
                "fgAtt": 0, 
                "fg50PlusAtt": 0, 
                "fg50PlusMade": 0,
                "fgLongest": 0, 
                "fgMade": 0, 
                "fgCompPct": 0, 
                "kickoffAtt": 0, 
                "kickoffTBs": 0, 
                "xpAtt": 0, 
                "xpMade": 0,
                "xpCompPct": 0
            }
            for (const week of weeklyStats){
                seasonStats.kickPts += week.kickPts; 
                seasonStats.fgAtt += week.fGAtt; 
                seasonStats.fg50PlusAtt += week.fG50PlusAtt; 
                seasonStats.fg50PlusMade += week.fG50PlusMade; 
                if (week.fGlongest > seasonStats.fgLongest) seasonStats.fgLongest = week.fGLongest; 
                seasonStats.fgMade += week.fGMade; 
                seasonStats.kickoffAtt += week.kickoffAtt; 
                seasonStats.kickoffTBs += week.kickoffTBs; 
                seasonStats.xpAtt += week.xPAtt; 
                seasonStats.xpMade += week.xPMade;
                if (week.awayTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.homeTeamId];
                }
                if (week.homeTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.awayTeamId];
                }
                delete week.awayTeamId; 
                delete week.homeTeamId;
            } 
            seasonStats.fgCompPct = seasonStats.fgMade / seasonStats.fgAtt; 
            seasonStats.xpCompPct = seasonStats.xpMade / seasonStats.xpAtt;
            seasonStats.name = weeklyStats[0].fullName;
            response.weeklyStats = weeklyStats; 
            response.seasonStats = seasonStats;
        }
    }else {
        weeklyStats = await defenseStatsQuery(playerId, seasonIndex); 
        console.log(weeklyStats);
        if (weeklyStats.length !== 0){
            seasonStats = {
                "name": '', 
                "defCatchAllowed": 0, 
                "defDeflections": 0, 
                "defForcedFum": 0, 
                "defFumRec": 0,
                "defInts": 0, 
                "defIntReturnYds": 0, 
                "defPts": 0, 
                "defSacks": 0, 
                "defSafeties": 0, 
                "defTDs": 0, 
                "defTotalTackles": 0
            }
            for (const week of weeklyStats){
                seasonStats.defCatchAllowed += week.defCatchAllowed; 
                seasonStats.defDeflections += week.defDeflections; 
                seasonStats.defForcedFum += week.defForcedFum;
                seasonStats.defFumRec += week.defFumRec;
                seasonStats.defInts += week.defInts;
                seasonStats.defIntReturnYds += week.defIntReturnYds;
                seasonStats.defPts += week.defPts;
                seasonStats.defSacks += week.defSacks;
                seasonStats.defSafeties += week.defSafeties;
                seasonStats.defTDs += week.defTDs; 
                seasonStats.defTotalTackles += week.defTotalTackles;
                if (week.awayTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.homeTeamId];
                }
                if (week.homeTeamId === week.teamId){
                    week['opponent'] = teamIdToName[week.awayTeamId];
                }
                delete week.awayTeamId; 
                delete week.homeTeamId;
            }
            seasonStats.name = weeklyStats[0].fullName; 
        }
    }


    // "SuperStars and X-Factor" players have unique abilities 
    if (playerInfo.devTrait >= 2){
        abilities = await playerAbilityQuery(playerId); 
        return {
            'player': playerInfo,
            'weeklyStats': weeklyStats,
            'seasonStats': seasonStats,
            'abilities': abilities
        }
    }else {
        return {
            'player': playerInfo,
            'weeklyStats': weeklyStats,
            'seasonStats': seasonStats
        }
    }

}

export default playerByIdService