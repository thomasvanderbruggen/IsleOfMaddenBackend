const SQL = require('sql-template-strings');
const mysql = require('mysql');
const { leagueId } = require('../resources/leagueId.json');
const res = require('express/lib/response');
const PoolConfig = require('mysql/lib/PoolConfig');

const connectionGenerator = () => {
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    return con; 
}

const adjustScheduleId = (scheduleId, seasonIndex) => {
    return scheduleId + (10000 * (1 - seasonIndex));
}


/* 
    Generates a fully unique ID to give to each player to be able to store
        their post-retirement stats. Cannot just use the in-game "rosterId" as that
        gets re-used after a player retires. 
        
    It converts the players first initial and their entire last name to ASCII code characters,
        then it adds the given rosterId to the end of that string.
*/

function generatePlayerIdWithFirstName(firstName, lastName, rosterId){
    let output = `${firstName.charCodeAt(0)}`; 
    for (let i = 0; i < lastName.length; i++){
        output += `${lastName.charCodeAt(i)}`;
    }
    output += `${rosterId}`
    return output;
}

/*
    Same thing as above but sometimes Madden sends the name in the "Full Name" variant. 
        'John Doe' for example is 'J. Doe' in the "Full Name" style. 
*/


function generatePlayerIdWithFullName(fullName, rosterId) {
    let output = `${fullName.charCodeAt(0)}`;
    const lastName = fullName.slice(3); 
    for (let i = 0; i < lastName.length; i++){
        output += `${lastName.charCodeAt(i)}`;
    }
    output += `${rosterId}`;
    return output;
}


const leagueInfo = (teams, teamsWithInfo, pool) => {
    for (let i = 0; i < teamsWithInfo.length; i++){
        teams[i] = {...teams[i], ...teamsWithInfo[i]};
    }
    pool.getConnection((err, con) => {
        for (const team of teams) {
            let sql = SQL`INSERT INTO teams (awayWins, awayLosses, awayTies, calendarYear, conferenceId, confLosses, conferenceName, confTies, confWins, 
                capRoom, capAvailable, capSpent, defPassYds, defPassYdsRank, defRushYds, defRushYdsRank, defTotalYds, defTotalYdsRank, divisionId,
                divLosses, divisionName, divTies, divWins, homeLosses, homeTies, homeWins, netPts, offPassYds, offPassYdsRank, offRushYds, offRushYdsRank, 
                offTotalYds, offTotalYdsRank, ptsAgainstRank, ptsForRank, playoffStatus, prevRank, ptsAgainst, ptsFor, teamRank, seed, seasonIndex, stageIndex, totalLosses, totalTies, 
                totalWins, teamId, teamName, teamOvr, tODiff, weekIndex, winLossStreak, winPct, abbrName, cityName, defScheme, injuryCount, logoId, nickName, offScheme, 
                ovrRating, primaryColor, secondaryColor, userName) VALUES (${team.awayWins}, ${team.awayLosses}, ${team.awayTies}, ${team.calendarYear}, ${team.conferenceId}, ${team.confLosses}, ${team.conferenceName},
                ${team.confTies}, ${team.confWins}, ${team.capRoom}, ${team.capAvailable}, ${team.capSpent}, ${team.defPassYds}, ${team.defPassYdsRank},${team.defRushYds}, ${team.defRushYdsRank}, 
                ${team.defTotalYds}, ${team.defTotalYdsRank}, ${team.divisionId}, ${team.divLosses}, ${team.divisionName}, ${team.divTies}, ${team.divWins}, ${team.homeLosses}, ${team.homeTies}, 
                ${team.homeWins}, ${team.netPts}, ${team.offPassYds}, ${team.offPassYdsRank}, ${team.offRushYds}, ${team.offRushYdsRank}, ${team.offTotalYds}, ${team.offTotalYdsRank}, ${team.ptsAgainstRank}, 
                ${team.ptsForRank}, ${team.playoffStatus}, ${team.prevRank},${team.ptsFor}, ${team.ptsAgainst}, ${team.rank}, ${team.seed}, ${team.seasonIndex}, ${team.stageIndex}, ${team.totalLosses},${team.totalTies}, ${team.totalWins}, 
                ${team.teamId}, ${team.teamName}, ${team.teamOvr}, ${team.tODiff}, ${team.weekIndex}, ${team.winLossStreak},${team.winPct}, ${team.abbrName}, ${team.cityName}, ${team.defScheme}, 
                ${team.injuryCount}, ${team.logoId}, ${team.nickName}, ${team.offScheme}, ${team.ovrRating}, ${team.primaryColor}, ${team.secondaryColor}, ${team.userName}) 
                ON DUPLICATE KEY UPDATE awayWins=VALUES(awayWins), awayLosses=VALUES(awayLosses), awayTies=VALUES(awayTies), calendarYear=VALUES(calendarYear), confLosses=VALUES(confLosses), confTies=VALUES(confTies), confWins=VALUES(confWins),
                capRoom=VALUES(capRoom), capAvailable=VALUES(capAvailable), capSpent=VALUES(capSpent), defPassYds=VALUES(defPassYds), defPassYdsRank=VALUES(defPassYdsRank), defRushYds=VALUES(defRushYds), defRushYdsRank=VALUES(defRushYdsRank),
                defTotalYds=VALUES(defTotalYds), defTotalYdsRank=VALUES(defTotalYdsRank), divLosses=VALUES(divLosses), divTies=VALUES(divTies), divWins=VALUES(divWins), homeLosses=VALUES(homeLosses), homeTies=VALUES(homeTies), homeWins=VALUES(homeWins),
                netPts=VALUES(netPts), offPassYds=VALUES(offPassYds), offPassYdsRank=VALUES(offPassYdsRank), offRushYds=VALUES(offRushYds), offRushYdsRank=VALUES(offRushYdsRank), offTotalYds=VALUES(offTotalYds), offTotalYdsRank=VALUES(offTotalYdsRank),
                ptsAgainstRank=VALUES(ptsAgainstRank), ptsForRank=VALUES(ptsForRank), playoffStatus=VALUES(playoffStatus), prevRank=VALUES(prevRank),ptsFor=VALUES(ptsFor), ptsAgainst=VALUES(ptsAgainst), teamRank=VALUES(teamRank), seed=VALUES(seed), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex),
                totalLosses=VALUES(totalLosses), totalTies=VALUES(totalTies), totalWins=VALUES(totalWins), teamOvr=VALUES(teamOvr), tODiff=VALUES(tODiff), weekIndex=VALUES(weekIndex), winLossStreak=VALUES(winLossStreak), winPct=VALUES(winPct),
                defScheme=VALUES(defScheme), injuryCount=VALUES(injuryCount), offScheme=VALUES(offScheme), ovrRating=VALUES(ovrRating), userName=VALUES(userName)`;
            con.query(sql, (err, res) => { 
                if (err) throw err;
            })
    
        }
    })

}

const teamWeeklyStats = (stats, weekType, pool) => {
    pool.getConnection((err, con) => {
        console.log('Inserting team stats');
        let sql; 
        for (const stat of stats) {
            stat.weekIndex++; 
            stat.scheduleId = adjustScheduleId(stat.scheduleId, stat.seasonIndex);      
            if (weekType === 'pre'){ 
                stat.weekIndex += 23
            }
            sql = SQL`INSERT INTO team_stats (defForcedFum, defFumRec, defIntsRec, defPtsPerGame, defPassYds, defRushYds,
                defRedZoneFGs, defRedZones, defRedZonePct, defRedZoneTDs, defSacks, defTotalYds, off4thDownAtt, off4thDownConv,
                off4thDownConvPct, offFumLost, offIntsLost, off1stDowns, offPtsPerGame, offPassTDs, offPassYds, offRushTDs, offRushYds,
                offRedZoneFGs, offRedZones, offRedZonePct, offRedZoneTDs, offSacks, off3rdDownAtt, off3rdDownConv, off3rdDownConvPct,
                off2PtAtt, off2PtConv, off2PtConvPct, offTotalYds, offTotalYdsGained, penalties, penaltyYds, scheduleId, seed, seasonIndex,
                statId, stageIndex, totalLosses, teamId, tODiff, tOGiveaways, tOTakeaways, totalTies, totalWins, weekIndex)
                VALUES (${stat.defForcedFum}, ${stat.defFumRec}, ${stat.defIntsRec}, ${stat.defPtsPerGame}, ${stat.defPassYds}, ${stat.defRushYds},
                ${stat.defRedZoneFGs}, ${stat.defRedZones}, ${stat.defRedZonePct}, ${stat.defRedZoneTDs}, ${stat.defSacks}, ${stat.defTotalYds},
                ${stat.off4thDownAtt}, ${stat.off4thDownConv}, ${stat.off4thDownConvPct}, ${stat.offFumLost}, ${stat.offIntsLost}, ${stat.off1stDowns},
                ${stat.offPtsPergame}, ${stat.offPassTds}, ${stat.offPassYds}, ${stat.offRushTDs}, ${stat.offRushYds}, ${stat.offRedZoneFGs}, ${stat.ofFRedZones},
                ${stat.offRedZonePct}, ${stat.offRedZoneTDs}, ${stat.offSacks}, ${stat.off3rdDownAtt}, ${stat.off3rdDownConv}, ${stat.off3rdDownConvPct}, ${stat.off2PtAtt},
                ${stat.off2PtConv}, ${stat.off2PtConvPct}, ${stat.offTotalYds}, ${stat.offTotalYdsGained}, ${stat.penalties}, ${stat.penaltyYds}, ${stat.scheduleId},
                ${stat.seed}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.totalLosses}, ${stat.teamId}, ${stat.tODiff}, ${stat.tOGiveaways}, ${stat.tOTakeaways},
                ${stat.totalTies}, ${stat.totalWins}, ${stat.weekIndex}) ON DUPLICATE KEY UPDATE defForcedFum=VALUES(defForcedFum), defFumRec=VALUES(defFumRec), defIntsRec=VALUES(defIntsRec), 
                defPtsPerGame=VALUES(defPtsPerGame), defPassYds=VALUES(defPassYds), defRushYds=VALUES(defRushYds), defRedZoneFGs=VALUES(defRedZoneFGs), defRedZones=VALUES(defRedZones), defRedZonePct=VALUES(defRedZonePct),
                defRedZoneTDs=VALUES(defRedZoneTDs), defSacks=VALUES(defSacks), defTotalYds=VALUES(defTotalYds), off4thDownAtt=VALUES(off4thDownAtt), off4thDownConv=VALUeS(off4thDownConv), off4thDownConvPct=VALUES(off4thDownConvPct), 
                offFumLost=VALUES(offFumLost), offIntsLost=VALUES(ofFIntsLost), off1stDowns=VALUES(off1stDowns), offPtsPerGame=VALUES(offPtsPerGame), offPassTDs=VALUES(offPassTDs), offPassYds=VALUES(offPassYds), offRushTDs=VALUES(ofFRushTDs),
                offRushYds=VALUES(offRushYds), offRedZoneFGs=VALUES(offRedZoneFGs), offRedZones=VALUES(ofFRedZones), offRedZonePct=VALUES(offRedZonePct), offRedZoneTDs=VALUES(offRedZoneTDs), offSacks=VALUES(offSacks), 
                off3rdDownAtt=VALUES(off3rdDownAtt), off3rdDownConv=VALUES(off3rdDownConv), off3rdDownConvPct=VALUES(off3rdDownConvPct), off2PtAtt=VALUES(off2PtAtt), off2PtConv=VALUES(off2PtConv), off2PtConvPct=VALUES(off2PtConvPct),
                offTotalYds=VALUES(offTotalYds), offTotalYdsGained=VALUES(offTotalYdsGained), penalties=VALUES(penalties), penaltyYds=VALUES(penaltyYds), scheduleId=VALUES(scheduleId), totalLosses=VALUES(totalLosses), tODiff=VALUES(tODiff),
                tOGiveaways=VALUES(tOGiveaways), tOTakeaways=VALUES(tOTakeaways), totalTies=VALUES(totalTies), totalWins=VALUES(totalWins), weekIndex=VALUES(weekIndex)`; 
            con.query(sql, (err, res) => { 
                if (err) throw err;
            })
        }
    })

}

const schedule = (games, weekType, pool) => {
    pool.getConnection((err, con) => {
        console.log('inserting schedule');
        let sql; 
        for (let game of games) {
            game.weekIndex++; 
            game.scheduleId = adjustScheduleId(game.scheduleId, game.seasonIndex);    
            if (weekType === 'pre'){ 
                game.weekIndex += 23; 
            }
            sql = SQL`INSERT INTO schedules (awayScore, awayTeamId, isGameOfTheWeek, homeScore, homeTeamId, scheduleId, seasonIndex, stageIndex, weekStatus, weekIndex) VALUES 
            (${game.awayScore}, ${game.awayTeamId}, ${game.isGameOfTheWeek}, ${game.homeScore}, ${game.homeTeamId}, ${game.scheduleId}, ${game.seasonIndex}, ${game.stageIndex}, ${game.status}, ${game.weekIndex}) 
            ON DUPLICATE KEY UPDATE awayScore=VALUES(awayScore), awayTeamId=VALUES(awayTeamId), isGameOfTheWeek=VALUES(isGameOfTheWeek), homeScore=VALUES(homeScore), homeTeamId=VALUES(homeTeamId), seasonIndex=VALUES(seasonIndex), weekStatus=VALUES(weekStatus), weekIndex=VALUES(weekIndex)`;                
            con.query(sql, (err, res) => { 
                if (err) throw err;
            })
        }
    })
}

const puntingWeeklyStats = (stats, weekType, pool) => {
    pool.getConnection((err, con) => {
        let sql;
        console.log('punting');
        for (let stat of stats) { 
            stat.weekIndex++; 
            stat.scheduleId = adjustScheduleId(stat.scheduleId, stat.seasonIndex);      
            if (weekType === 'pre'){ 
                stat.weekIndex += 23; 
            }
            sql = SQL`INSERT INTO punting_stats (fullName, puntsBlocked, puntsIn20, puntLongest, puntTBs, puntNetYdsPerAtt, puntNetYds, puntAtt, rosterId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES
            (${stat.fullName}, ${stat.puntsBlocked}, ${stat.puntsIn20}, ${stat.puntLongest}, ${stat.puntTBs}, ${stat.puntNetYdsPerAtt}, ${stat.puntNetYds}, ${stat.puntAtt}, ${stat.rosterId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), puntsBlocked=VALUES(puntsBlocked), puntsIn20=VALUES(puntsIn20), puntLongest=VALUES(puntLongest), puntTBs=VALUES(puntTBs), puntNetYdsPerAtt=VALUES(puntNetYdsPerAtt), puntNetYds=VALUES(puntNetYds), rosterId=VALUES(rosterId), scheduleId=VALUES(scheduleId), seasonIndex=VALUES(seasonIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
            con.query(sql, (err, res) => { 
                if (err) throw err;
            })
        } 
    })
}

const passingWeeklyStats = (stats, weekType,pool) => {  
    pool.getConnection((err, con) => {
        console.log('passing');
        let sql;
        for (let stat of stats) {
            stat.weekIndex++;
            stat.scheduleId = adjustScheduleId(stat.scheduleId, stat.seasonIndex); 
            if (weekType === 'pre'){ 
                stat.weekIndex += 23; 
            }
            sql = SQL`INSERT INTO passing_stats (fullName, passAtt, passComp, passCompPct, passInts, passLongest, passPts, passerRating, passSacks, passTDs, passYds, passYdsPerAtt, passYdsPerGame, rosterid, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
            (${stat.fullName}, ${stat.passAtt}, ${stat.passComp}, ${stat.passCompPct}, ${stat.passInts}, ${stat.passLongest}, ${stat.passPts}, ${stat.passerRating}, ${stat.passSacks}, ${stat.passTDs}, ${stat.passYds}, ${stat.passYdsPerAtt}, ${stat.passYdsPerGame}, ${stat.rosterId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), passAtt=VALUES(passAtt), passComp=VALUES(passComp), passInts=VALUES(passInts), passLongest=VALUES(passLongest), passPts=VALUES(passPts), passerRating=VALUES(passerRating), passSacks=VALUES(passSacks), passTDs=VALUES(passTDs), passYds=VALUES(passYds), passYdsPerAtt=VALUES(passYdsPerAtt), passYdsPerGame=VALUES(passYdsPerGame), rosterId=VALUES(rosterId), scheduleId=VALUES(scheduleId),
            seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
            con.query(sql, (err, res) => { 
                if (err) throw err;
            })
        }
    })
}

const defensiveWeeklyStats = (stats, weekType, pool) => {
    pool.getConnection((err, con)=>{
        console.log('defensive');
        let sql;
        for (let stat of stats) {
            stat.weekIndex++; 
            stat.scheduleId = adjustScheduleId(stat.scheduleId, stat.seasonIndex);
            if (weekType === 'pre'){ 
                stat.weekIndex += 23; 
            }
            stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId);
    
            sql = SQL`INSERT INTO defensive_stats (defCatchAllowed, defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs, defTotalTackles, fullName, rosterId, playerId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
            (${stat.defCatchAllowed}, ${stat.defDeflections}, ${stat.defForcedFum}, ${stat.defFumRec}, ${stat.defInts}, ${stat.defIntReturnYds}, ${stat.defPts}, ${stat.defSacks}, ${stat.defSafeties}, ${stat.defTDs}, ${stat.defTotalTackles}, ${stat.fullName}, ${stat.rosterId}, ${stat.playerId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
            ON DUPLICATE KEY UPDATE defCatchAllowed=VALUES(defCatchAllowed), defDeflections=VALUES(defDeflections), defForcedFum=VALUES(defForcedFum), defFumRec=VALUES(defFumRec), defInts=VALUES(defInts), defIntReturnYds=VALUES(defIntReturnYds),
            defPts=VALUES(defPts), defSacks=VALUES(defSacks), defSafeties=VALUES(defSafeties), defTDs=VALUES(defTDs), defTotalTackles=VALUES(defTotalTackles), scheduleId=VALUES(scheduleId), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
            con.query(sql, (err, res) => {
                if (err) throw err;
            })
        }
    })

 
}

const kickingWeeklyStats = (stats, weekType, pool) => {
    pool.getConnection((err, con)=>{
        console.log('kicking');
        let sql;
        for (let stat of stats) { 
            stat.weekIndex++; 
            stat.scheduleId = adjustScheduleId(stat.scheduleId, stat.seasonIndex);
            if (weekType === 'pre'){ 
                stat.weekIndex += 23; 
            }
            stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId);
            sql = SQL`INSERT INTO kicking_stats (kickPts, fGAtt, fG50PlusAtt, fG50PlusMade, fGLongest, fGMade, fGCompPct, fullName, kickoffAtt, kickoffTBs, rosterId, playerId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex, xPAtt, xPMade, xPCompPct)
            VALUES (${stat.kickPts}, ${stat.fGAtt}, ${stat.fG50PlusAtt}, ${stat.fG50PlusMade}, ${stat.fGLongest}, ${stat.fGMade}, ${stat.fGCompPct}, ${stat.fullName}, ${stat.kickoffAtt}, ${stat.kickoffTBs}, ${stat.rosterId}, ${stat.playerId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex}, ${stat.xPAtt}, ${stat.xPMade}, ${stat.xPCompPct})
            ON DUPLICATE KEY UPDATE kickPts=VALUES(kickPts), fGAtt=VALUES(fGAtt), fG50PlusAtt=VALUES(fG50PlusAtt), fG50PlusMade=VALUES(fG50PlusMade), fGLongest=VALUES(fGLongest), fGMade=VALUES(fGMade), fGCompPct=VALUES(fGCompPct), kickoffAtt=VALUES(kickoffAtt), kickoffTBs=VALUES(kickoffTBs), rosterId=VALUES(rosterId), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), weekIndex=VALUES(weekIndex), xPAtt=VALUES(xPAtt), xPMade=VALUES(xPMade), xPCompPct=VALUES(xPCompPct)`;
            con.query(sql, (err, res) => { 
                if (err) throw err;
            })
        } 
    })
}

const rushingWeeklyStats = (stats, weekType, pool) => {
    pool.getConnection((err, con) => {
        console.log('rushing');
        let sql;
        for (let stat of stats) { 
            stat.weekIndex++; 
            stat.scheduleId = adjustScheduleId(stat.scheduleId, stat.seasonIndex);
            if (weekType === 'pre'){ 
                stat.weekIndex += 23; 
            }
            stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId);
            sql = SQL`INSERT INTO rushing_stats (fullName, rushAtt, rushBrokenTackles, rushFum, rushLongest, rushPts, rosterId, playerId, rushTDs, rushToPct, rush20PlusYds, rushYdsAfterContact, rushYds, rushYdsPerAtt, rushYdsPerGame, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
            (${stat.fullName}, ${stat.rushAtt}, ${stat.rushBrokenTackles}, ${stat.rushFum}, ${stat.rushLongest}, ${stat.rushPts}, ${stat.rosterId}, ${stat.playerId}, ${stat.rushTDs}, ${stat.rushToPct}, ${stat.rush20PlusYds}, ${stat.rushYdsAfterContact}, ${stat.rushYds}, ${stat.rushYdsPerAtt}, ${stat.rushYdsPerGame}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), rushAtt=VALUES(rushAtt), rushBrokenTackles=VALUES(rushBrokenTackles), rushFum=VALUES(rushFum), rushLongest=VALUES(rushLongest), rushPts=VALUES(rushPts), rosterId=VALUES(rosterId), rushTDs=VALUES(rushTDs), rushToPct=VALUES(rushToPct), rush20PlusYds=VALUES(rush20PlusYds), rushYdsAfterContact=VALUES(rushYdsAfterContact), rushYds=VALUES(rushYds), rushYdsPerAtt=VALUES(rushYdsPerAtt), rushYdsPerGame=VALUES(rushYdsPerGame), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex)`;
            con.query(sql, (err, res) => {
                if (err) throw err;
            })
        }
    })
}

const receivingWeeklyStats = (stats, weekType, pool) => {
    pool.getConnection((err, con) => {
        console.log('receiving');
        let sql;
        for (let stat of stats) {
            stat.weekIndex++; 
            stat.scheduleId = adjustScheduleId(stat.scheduleId, stat.seasonIndex);
            if (weekType === 'pre'){ 
                stat.weekIndex += 23; 
            }
            stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId);
            sql = SQL`INSERT INTO receiving_stats (fullName, recCatches, recCatchPct, recDrops, recLongest, recPts, rosterId, playerId, recTDs, recToPct, recYdsAfterCatch, recYacPerCatch, recYds, recYdsPerCatch, recYdsPerGame, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
            (${stat.fullName}, ${stat.recCatches}, ${stat.recCatchPct}, ${stat.recDrops}, ${stat.recLongest}, ${stat.recPts}, ${stat.rosterId}, ${stat.playerId}, ${stat.recTDs}, ${stat.recToPct}, ${stat.recYdsAfterCatch}, ${stat.recYacPerCatch}, ${stat.recYds}, ${stat.recYdsPerCatch}, ${stat.recYdsPerGame}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
            ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), recCatches=VALUES(recCatches), recCatchPct=VALUES(recCatchPct), recDrops=VALUES(recDrops), recLongest=VALUES(recLongest), recPts=VALUES(recPts), rosterId=VALUES(rosterId), recTDs=VALUES(recTDs), recToPct=VALUES(recToPct), recYdsAfterCatch=VALUES(recYdsAfterCatch), recYacPerCatch=VALUES(recYacPerCatch),
            recYds=VALUES(recYds), recYdsPerCatch=VALUES(recYdsPerCatch), recYdsPerGame=VALUES(recYdsPerGame), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
            con.query(sql, (err, res) => {
                if (err) throw err;
            })
        }
    })

    
}

const freeAgents = (players, pool) => {
    pool.getConnection((err, con) => {
        let sql;
        for (let player of players) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            player['playerId'] = generatePlayerIdWithFirstName(player.firstName, player.lastName, player.rosterId);
    
            // 118 values
            sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryRating, injuryLength, injuryType,
                intangibleGrade, isActive, isFreeAgent, isOnIr, isOnPracticeSquad, jerseyNum, jukeMoveRating, jumpRating, kickAccRating, kickPowerRating, kickRetRating,
                lBStyleTrait, lastName, leadBlockRating, legacyScore, manCoverRating, passBlockFinesseRating, passBlockPowerRating, passBlockRating, penaltyTrait, physicalGrade,
                playActionRating, playBallTrait, playRecRating, playerBestOvr, playerId, playerSchemeOvr, portraitId, posCatchTrait, position, powerMovesRating, predictTrait, presentationId, pressRating, productionGrade, 
                pursuitRating, qBStyleTrait, reSignStatus, releaseRating, rookieYear, rosterId, routeRunDeepRating, routeRunMedRating, routeRunShortRating, runBlockFinesseRating, runBlockPowerRating, 
                runBlockRating, runStyle, scheme, sensePressureTrait, sizeGrade, skillPoints, specCatchRating, speedRating, spinMoveRating, staminaRating, stiffArmRating, strengthRating, stripBallTrait, 
                tackleRating, teamId, teamSchemeOvr, throwAccDeepRating, throwAccMedRating, throwAccRating, throwAccShortRating, throwAwayTrait, throwOnRunRating, throwPowerRating, throwUnderPressureRating, 
                tightSpiralTrait, toughRating, truckRating, weight, yACCatchTrait, yearsPro, zoneCoverRating) VALUES (${player.accelRating}, ${player.age}, ${player.agilityRating}, ${player.awareRating}, ${player.bCVRating},
                ${player.bigHitTrait}, ${player.birthDay}, ${player.birthMonth}, ${player.birthYear}, ${player.blockShedRating}, ${player.breakSackRating}, ${player.breakTackleRating}, ${player.cITRating}, ${player.capHit},
                ${player.capReleaseNetSavings}, ${player.capReleasePenalty}, ${player.carryRating}, ${player.catchRating}, ${player.changeOfDirectionRating}, ${player.clutchTrait}, ${player.college}, ${player.confRating},
                ${player.contractBonus}, ${player.contractLength}, ${player.contractSalary}, ${player.contractYearsLeft}, ${player.coverBallTrait}, ${player.dLBullRushTrait}, ${player.dLSpinTrait}, ${player.dLSwimTrait},
                ${player.desiredBonus}, ${player.desiredLength}, ${player.desiredSalary}, ${player.devTrait}, ${player.draftPick}, ${player.draftRound}, ${player.dropOpenPassTrait}, ${player.durabilityGrade}, ${player.experiencePoints},${player.feetInBoundsTrait},
                ${player.fightForYardsTrait}, ${player.finesseMovesRating}, ${player.firstName}, ${player.forcePassTrait}, ${player.hPCatchTrait}, ${player.height}, ${player.highMotorTrait}, ${player.hitPowerRating}, ${player.homeState},
                ${player.homeTown}, ${player.impactBlockRating},${player.injuryRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIR}, ${player.isOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
                ${player.kickAccRating}, ${player.kickPowerRating}, ${player.kickRetRating}, ${player.lBStyleTrait}, ${player.lastName}, ${player.leadBlockRating}, ${player.legacyScore}, ${player.manCoverRating}, ${player.passBlockFinesseRating},
                ${player.passBlockPowerRating}, ${player.passBlockRating}, ${player.penaltyTrait}, ${player.physicalGrade}, ${player.playActionRating}, ${player.playBallTrait}, ${player.playRecRating}, ${player.playerBestOvr}, ${player.playerId}, ${player.playerSchemeOvr},
                ${player.portraitId}, ${player.posCatchTrait}, ${player.position}, ${player.powerMovesRating}, ${player.predictTrait}, ${player.presentationId}, ${player.pressRating}, ${player.productionGrade}, ${player.pursuitRating}, 
                ${player.qBStyleTrait}, ${player.reSignStatus}, ${player.releaseRating}, ${player.rookieYear}, ${player.rosterId}, ${player.routeRunDeepRating}, ${player.routeRunMedRating}, ${player.routeRunShortRating}, ${player.runBlockFinesseRating}, ${player.runBlockPowerRating}, ${player.runBlockRating},
                ${player.runStyle}, ${player.scheme}, ${player.sensePressureTrait}, ${player.sizeGrade}, ${player.skillPoints}, ${player.specCatchRating}, ${player.speedRating}, ${player.spinMoveRating}, ${player.staminaRating}, ${player.stiffArmRating},
                ${player.strengthRating}, ${player.stripBallTrait}, ${player.tackleRating}, ${player.teamId}, ${player.teamSchemeOvr}, ${player.throwAccDeepRating}, ${player.throwAccMidRating}, ${player.throwAccRating}, ${player.throwAccShortRating},
                ${player.throwAwayTrait}, ${player.throwOnRunRating}, ${player.throwPowerRating}, ${player.throwUnderPressureRating}, ${player.tightSpiralTrait}, ${player.toughRating}, ${player.truckRating}, ${player.weight}, ${player.yACCatchTrait}, ${player.yearsPro}, ${player.zoneCoverRating})
                ON DUPLICATE KEY UPDATE accelRating=VALUES(accelRating), age=VALUES(age), agilityRating=VALUES(agilityRating), awareRating=VALUES(awareRating), bCVRating=VALUES(bCVRating), blockShedrating=VALUES(blockShedRating), breakSackRating=VALUES(breakSackRating), 
                breakTackleRating=VALUES(breakTackleRating), cITRating=VALUES(cITRating), capHit=VALUES(capHit), capReleaseNetSavings=VALUES(capReleaseNetSavings), carryRating=VALUES(carryRating), catchRating=VALUES(catchRating), changeOfDirectionRating=VALUES(changeOfDirectionRating), confRating=VALUES(confRating), 
                contractBonus=VALUES(contractBonus), contractLength=VALUES(contractLength), contractSalary=VALUES(contractSalary), contractYearsLeft=VALUES(contractYearsLeft), desiredBonus=VALUES(desiredBonus), desiredLength=VALUES(desiredLength),
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryRating=VALUES(injuryRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr), playerId=VALUES(playerId),
                    playerSchemeOvr=VALUES(playerSchemeOvr), posCatchTrait=VALUES(posCatchTrait), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), pursuitRating=VALUES(pursuitRating), 
                    reSignStatus=VALUES(reSignStatus), releaseRating=VALUES(releaseRating), routeRunDeepRating=VALUES(routeRunDeepRating), routeRunMedRating=VALUES(routeRunMedRating), routeRunShortRating=VALUES(routeRunShortRating), 
                    runBlockFinesseRating=VALUES(runBlockFinesseRating), runBlockPowerRating=VALUES(runBlockPowerRating), runBlockRating=VALUES(runBlockRating), runStyle=VALUES(runStyle), scheme=VALUES(scheme), sizeGrade=VALUES(sizeGrade), 
                    skillPoints=VALUES(skillPoints), specCatchRating=VALUES(specCatchRating), speedRating=VALUES(speedRating), spinMoveRating=VALUES(spinMoveRating), staminaRating=VALUES(staminaRating), stiffArmRating=VALUES(stiffArmRating),
                    strengthRating=VALUES(strengthRating), tackleRating=VALUES(tackleRating), teamId=VALUES(teamId), teamSchemeOvr=VALUES(teamSchemeOvr), throwAccDeepRating=VALUES(throwAccDeepRating), throwAccMedRating=VALUES(throwAccMedRating),
                    throwAccRating=VALUES(throwAccRating), throwAccShortRating=VALUES(throwAccShortRating), throwOnRunRating=VALUES(throwOnRunRating), throwPowerRating=VALUES(throwPowerRating), throwUnderPressureRating=VALUES(throwUnderPressureRating), 
                    toughRating=VALUES(toughRating), truckRating=VALUES(truckRating), weight=VALUES(weight), yACCatchTrait=VALUES(yACCatchTrait), yearsPro=VALUES(yearsPro), zoneCoverRating=VALUES(zoneCoverRating)`;
                    
                    con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
    
        }
    })
}

const teamRosters = (players, pool) => {
    pool.getConnection((err, con) => {
        let sql;
        for (let player of players) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            player['playerId'] = generatePlayerIdWithFirstName(player.firstName, player.lastName, player.rosterId);
            // 118 values
            if (player.rosterId == 553126364){
                console.log(player.playerId);
            }
            sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryRating, injuryLength, injuryType,
                intangibleGrade, isActive, isFreeAgent, isOnIr, isOnPracticeSquad, jerseyNum, jukeMoveRating, jumpRating, kickAccRating, kickPowerRating, kickRetRating,
                lBStyleTrait, lastName, leadBlockRating, legacyScore, manCoverRating, passBlockFinesseRating, passBlockPowerRating, passBlockRating, penaltyTrait, physicalGrade,
                playActionRating, playBallTrait, playRecRating, playerBestOvr, playerId, playerSchemeOvr, portraitId, posCatchTrait, position, powerMovesRating, predictTrait, presentationId, pressRating, productionGrade, 
                pursuitRating, qBStyleTrait, reSignStatus, releaseRating, rookieYear, rosterId, routeRunDeepRating, routeRunMedRating, routeRunShortRating, runBlockFinesseRating, runBlockPowerRating, 
                runBlockRating, runStyle, scheme, sensePressureTrait, sizeGrade, skillPoints, specCatchRating, speedRating, spinMoveRating, staminaRating, stiffArmRating, strengthRating, stripBallTrait, 
                tackleRating, teamId, teamSchemeOvr, throwAccDeepRating, throwAccMedRating, throwAccRating, throwAccShortRating, throwAwayTrait, throwOnRunRating, throwPowerRating, throwUnderPressureRating, 
                tightSpiralTrait, toughRating, truckRating, weight, yACCatchTrait, yearsPro, zoneCoverRating) VALUES (${player.accelRating}, ${player.age}, ${player.agilityRating}, ${player.awareRating}, ${player.bCVRating},
                ${player.bigHitTrait}, ${player.birthDay}, ${player.birthMonth}, ${player.birthYear}, ${player.blockShedRating}, ${player.breakSackRating}, ${player.breakTackleRating}, ${player.cITRating}, ${player.capHit},
                ${player.capReleaseNetSavings}, ${player.capReleasePenalty}, ${player.carryRating}, ${player.catchRating}, ${player.changeOfDirectionRating}, ${player.clutchTrait}, ${player.college}, ${player.confRating},
                ${player.contractBonus}, ${player.contractLength}, ${player.contractSalary}, ${player.contractYearsLeft}, ${player.coverBallTrait}, ${player.dLBullRushTrait}, ${player.dLSpinTrait}, ${player.dLSwimTrait},
                ${player.desiredBonus}, ${player.desiredLength}, ${player.desiredSalary}, ${player.devTrait}, ${player.draftPick}, ${player.draftRound}, ${player.dropOpenPassTrait}, ${player.durabilityGrade}, ${player.experiencePoints},${player.feetInBoundsTrait},
                ${player.fightForYardsTrait}, ${player.finesseMovesRating}, ${player.firstName}, ${player.forcePassTrait}, ${player.hPCatchTrait}, ${player.height}, ${player.highMotorTrait}, ${player.hitPowerRating}, ${player.homeState},
                ${player.homeTown}, ${player.impactBlockRating},${player.injuryRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIR}, ${player.isOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
                ${player.kickAccRating}, ${player.kickPowerRating}, ${player.kickRetRating}, ${player.lBStyleTrait}, ${player.lastName}, ${player.leadBlockRating}, ${player.legacyScore}, ${player.manCoverRating}, ${player.passBlockFinesseRating},
                ${player.passBlockPowerRating}, ${player.passBlockRating}, ${player.penaltyTrait}, ${player.physicalGrade}, ${player.playActionRating}, ${player.playBallTrait}, ${player.playRecRating}, ${player.playerBestOvr}, ${player.playerId}, ${player.playerSchemeOvr},
                ${player.portraitId}, ${player.posCatchTrait}, ${player.position}, ${player.powerMovesRating}, ${player.predictTrait}, ${player.presentationId}, ${player.pressRating}, ${player.productionGrade}, ${player.pursuitRating}, 
                ${player.qBStyleTrait}, ${player.reSignStatus}, ${player.releaseRating}, ${player.rookieYear}, ${player.rosterId}, ${player.routeRunDeepRating}, ${player.routeRunMedRating}, ${player.routeRunShortRating}, ${player.runBlockFinesseRating}, ${player.runBlockPowerRating}, ${player.runBlockRating},
                ${player.runStyle}, ${player.scheme}, ${player.sensePressureTrait}, ${player.sizeGrade}, ${player.skillPoints}, ${player.specCatchRating}, ${player.speedRating}, ${player.spinMoveRating}, ${player.staminaRating}, ${player.stiffArmRating},
                ${player.strengthRating}, ${player.stripBallTrait}, ${player.tackleRating}, ${player.teamId}, ${player.teamSchemeOvr}, ${player.throwAccDeepRating}, ${player.throwAccMidRating}, ${player.throwAccRating}, ${player.throwAccShortRating},
                ${player.throwAwayTrait}, ${player.throwOnRunRating}, ${player.throwPowerRating}, ${player.throwUnderPressureRating}, ${player.tightSpiralTrait}, ${player.toughRating}, ${player.truckRating}, ${player.weight}, ${player.yACCatchTrait}, ${player.yearsPro}, ${player.zoneCoverRating})
                ON DUPLICATE KEY UPDATE accelRating=VALUES(accelRating), age=VALUES(age), agilityRating=VALUES(agilityRating), awareRating=VALUES(awareRating), bCVRating=VALUES(bCVRating), blockShedrating=VALUES(blockShedRating), breakSackRating=VALUES(breakSackRating), 
                breakTackleRating=VALUES(breakTackleRating), cITRating=VALUES(cITRating), capHit=VALUES(capHit), capReleaseNetSavings=VALUES(capReleaseNetSavings), carryRating=VALUES(carryRating), catchRating=VALUES(catchRating), changeOfDirectionRating=VALUES(changeOfDirectionRating), confRating=VALUES(confRating), 
                contractBonus=VALUES(contractBonus), contractLength=VALUES(contractLength), contractSalary=VALUES(contractSalary), contractYearsLeft=VALUES(contractYearsLeft), desiredBonus=VALUES(desiredBonus), desiredLength=VALUES(desiredLength),
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryRating=VALUES(injuryRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr),
                    playerSchemeOvr=VALUES(playerSchemeOvr), posCatchTrait=VALUES(posCatchTrait), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), playerId=VALUES(playerId), pursuitRating=VALUES(pursuitRating), 
                    reSignStatus=VALUES(reSignStatus), releaseRating=VALUES(releaseRating), routeRunDeepRating=VALUES(routeRunDeepRating), routeRunMedRating=VALUES(routeRunMedRating), routeRunShortRating=VALUES(routeRunShortRating), 
                    runBlockFinesseRating=VALUES(runBlockFinesseRating), runBlockPowerRating=VALUES(runBlockPowerRating), runBlockRating=VALUES(runBlockRating), runStyle=VALUES(runStyle), scheme=VALUES(scheme), sizeGrade=VALUES(sizeGrade), 
                    skillPoints=VALUES(skillPoints), specCatchRating=VALUES(specCatchRating), speedRating=VALUES(speedRating), spinMoveRating=VALUES(spinMoveRating), staminaRating=VALUES(staminaRating), stiffArmRating=VALUES(stiffArmRating),
                    strengthRating=VALUES(strengthRating), tackleRating=VALUES(tackleRating), teamId=VALUES(teamId), teamSchemeOvr=VALUES(teamSchemeOvr), throwAccDeepRating=VALUES(throwAccDeepRating), throwAccMedRating=VALUES(throwAccMedRating),
                    throwAccRating=VALUES(throwAccRating), throwAccShortRating=VALUES(throwAccShortRating), throwOnRunRating=VALUES(throwOnRunRating), throwPowerRating=VALUES(throwPowerRating), throwUnderPressureRating=VALUES(throwUnderPressureRating), 
                    toughRating=VALUES(toughRating), truckRating=VALUES(truckRating), weight=VALUES(weight), yACCatchTrait=VALUES(yACCatchTrait), yearsPro=VALUES(yearsPro), zoneCoverRating=VALUES(zoneCoverRating)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
                
            
            
            if (player.signatureSlotList !== undefined){
                for (let ability of player.signatureSlotList){
                    if (ability.signatureAbility.signatureLogoId !== 0){
                        ability.abilityId = ability.signatureAbility.signatureLogoId + player.playerId; 
                        let sql = SQL`INSERT INTO player_abilities (abilityId, abilityTitle, abilityLogo, abilityDescription, rosterId, playerId) VALUES (${ability.abilityId}, ${ability.signatureAbility.signatureTitle}, ${ability.signatureAbility.signatureLogoId}, ${ability.signatureAbility.signatureDescription}, ${player.rosterId}, ${player.playerId}) ON DUPLICATE KEY UPDATE abilityId=${ability.abilityId}, abilityLogo=VALUES(abilityLogo), playerId=VALUES(playerId)`;
                        con.query(sql, (err, res) => {
                            if (err) throw err;
                     })
                    }
    
                }
            }
        
            }
    })
 
}

exports.leagueInfo = leagueInfo;
exports.teamWeeklyStats = teamWeeklyStats;
exports.schedule = schedule;
exports.passingWeeklyStats = passingWeeklyStats;
exports.defensiveWeeklyStats = defensiveWeeklyStats; 
exports.puntingWeeklyStats = puntingWeeklyStats; 
exports.kickingWeeklyStats = kickingWeeklyStats;
exports.rushingWeeklyStats = rushingWeeklyStats; 
exports.receivingWeeklyStats = receivingWeeklyStats;
exports.freeAgents = freeAgents;
exports.teamRosters = teamRosters;