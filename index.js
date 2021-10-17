const express = require('express'); 
const mysql = require('mysql');
const app = express(); 
const SQL = require('sql-template-strings');
let teamInfoKeys = []; 
let teamStandingsKeys = [];
let teamsWithInfo = []; 
app.set('port', (process.env.PORT || 3001)); 

app.get('*', (req, res) => { 
    res.send('Testing'); 
});

app.post('/:platform/:leagueId/leagueTeams', (req, res) => { 
    let body = ''; 
    req.on('data', chunk=>{ 
        body += chunk.toString();
    })
    req.on('end', () =>{ 
        const teams = JSON.parse(body)['leagueTeamInfoList'];
        console.log('----Teams----');
        Object.keys(teams[0]).forEach(key => { 
            console.log(`${key} ${teams[0][key]}`);
        });
        for (const team of teams) { 
            teamsWithInfo.push(team); 
        }
        res.sendStatus(200);
    })
})

app.post('/:platform/:leagueId/standings', (req, res) => { 
    let body = ''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 
    req.on('end', () => { 
        console.log('----Standings----');
        const teams = JSON.parse(body)['teamStandingInfoList'];
        Object.keys(teams[0]).forEach(key => { 
            teamStandingsKeys.push(key);
            console.log(key);
        })
        for (let i = 0; i < teamsWithInfo.length; i++){ 
            teams[i] = {...teams[i], ...teamsWithInfo[i]};  
        }
        console.log('----Merged----');
        Object.keys(teams[0]).forEach(key => { 
            console.log(`${key} ${teams[0][key]} ${typeof teams[0][key]}`);
        })
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
        });
        let sqlTeams = [];
        let counter = 0; 
        for (const team of teams) {
                let sql = SQL`INSERT INTO teams (awayLosses, awayTies, calendarYear, conferenceId, confLosses, conferenceName, confTies, confWins, 
                    capRoom, capAvailable, capSpent, defPassYds, defPassYdsRank, defRushYds, defRushYdsRank, defTotalYds, defTotalYdsRank, divisionId,
                    divLosses, divisionName, divTies, divWins, homeLosses, homeTies, homeWins, netPts, offPassYds, offPassYdsRank, offRushYds, offRushYdsRank, 
                    offTotalYds, offTotalYdsRank, ptsAgainstRank, ptsForRank, playoffStatus, prevRank, teamRank, seed, seasonIndex, stageIndex, totalLosses, totalTies, 
                    totalWins, teamId, teamName, teamOvr, tODiff, weekIndex, winLossStreak, winPct, abbrName, cityName, defScheme, injuryCount, logoId, nickName, offScheme, 
                    ovrRating, primaryColor, secondaryColor, userName) VALUES (${team.awayLosses}, ${team.awayTies}, ${team.calendarYear}, ${team.conferenceId}, ${team.confLosses}, ${team.conferenceName},
                    ${team.confTies}, ${team.confWins}, ${team.capRoom}, ${team.capAvailable}, ${team.capSpent}, ${team.defPassYds}, ${team.defPassYdsRank},${team.defRushYds}, ${team.defRushYdsRank}, 
                    ${team.defTotalYds}, ${team.defTotalYdsRank}, ${team.divisionId}, ${team.divLosses}, ${team.divisionName}, ${team.divTies}, ${team.divWins}, ${team.homeLosses}, ${team.homeTies}, 
                    ${team.homeWins}, ${team.netPts}, ${team.offPassYds}, ${team.offPassYdsRank}, ${team.offRushYds}, ${team.offRushYdsRank}, ${team.offTotalYds}, ${team.offTotalYdsRank}, ${team.ptsAgainstRank}, 
                    ${team.ptsForRank}, ${team.playoffStatus}, ${team.prevRank}, ${team.rank}, ${team.seed}, ${team.seasonIndex}, ${team.stageIndex}, ${team.totalLosses},${team.totalTies}, ${team.totalWins}, 
                    ${team.teamId}, ${team.teamName}, ${team.teamOvr}, ${team.tODiff}, ${team.weekIndex}, ${team.winLossStreak},${team.winPct}, ${team.abbrName}, ${team.cityName}, ${team.defScheme}, 
                    ${team.injuryCount}, ${team.logoId}, ${team.nickName}, ${team.offScheme}, ${team.ovrRating}, ${team.primaryColor}, ${team.secondaryColor}, ${team.userName}) 
                    ON DUPLICATE KEY UPDATE awayLosses=VALUES(awayLosses), awayTies=VALUES(awayTies), calendarYear=VALUES(calendarYear), confLosses=VALUES(confLosses), confTies=VALUES(confTies), confWins=VALUES(confWins),
                    capRoom=VALUES(capRoom), capAvailable=VALUES(capAvailable), capSpent=VALUES(capSpent), defPassYds=VALUES(defPassYds), defPassYdsRank=VALUES(defPassYdsRank), defRushYds=VALUES(defRushYds), defRushYdsRank=VALUES(defRushYdsRank),
                    defTotalYds=VALUES(defTotalYds), defTotalYdsRank=VALUES(defTotalYdsRank), divLosses=VALUES(divLosses), divTies=VALUES(divTies), divWins=VALUES(divWins), homeLosses=VALUES(homeLosses), homeTies=VALUES(homeTies), homeWins=VALUES(homeWins),
                    netPts=VALUES(netPts), offPassYds=VALUES(offPassYds), offPassYdsRank=VALUES(offPassYdsRank), offRushYds=VALUES(offRushYds), offRushYdsRank=VALUES(offRushYdsRank), offTotalYds=VALUES(offTotalYds), offTotalYdsRank=VALUES(offTotalYdsRank),
                    ptsAgainstRank=VALUES(ptsAgainstRank), ptsForRank=VALUES(ptsForRank), playoffStatus=VALUES(playoffStatus), prevRank=VALUES(prevRank), teamRank=VALUES(teamRank), seed=VALUES(seed), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex),
                    totalLosses=VALUES(totalLosses), totalTies=VALUES(totalTies), totalWins=VALUES(totalWins), teamOvr=VALUES(teamOvr), tODiff=VALUES(tODiff), weekIndex=VALUES(weekIndex), winLossStreak=VALUES(winLossStreak), winPct=VALUES(winPct),
                    defScheme=VALUES(defScheme), injuryCount=VALUES(injuryCount), offScheme=VALUES(offScheme), ovrRating=VALUES(ovrRating), userName=VALUES(userName)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })

        }
        con.end();
        teamsWithInfo = []; 
        res.sendStatus(200); 
    });
})

let counter = 0; 
app.post('/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => { 
    let body = ''; 

    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 

    req.on('end', () => {
        const {params: {dataType},} = req; 
        console.log(`----${dataType}----`);
        let json = JSON.parse(body)
        let stat = {}; 
        // if (dataType === 'teamstats'){  
        //     stat = json['teamStatInfoList'][0]; 
        // }else if (dataType === 'schedules'){ 
        //     stat= json['gameScheduleInfoList'][0]; 
        // }else if (dataType === 'punting'){ 
        //     stat = json['playerPuntingStatInfoList'][0]; 
        // }else if (dataType === 'passing'){ 
        //     stat = json['playerPassingStatInfoList'][0];
        // }else if (dataType === 'defense'){ 
        //     stat = json['playerDefensiveStatInfoList'][0]; 
        // }else if (dataType === 'kicking'){ 
        //     stat = json['playerKickingStatInfoList'][0]; 
        // }else if (dataType === 'rushing') {
        //     stat = json['playerRushingStatInfoList'][0]; 
        // }else if (dataType === 'receiving') { 
        //     stat = json['playerReceivingStatInfoList'][0];
        // }
        // Object.keys(stat).forEach(key => { 
        //     console.log(`${key} ${typeof stat[key]}`);
        // }) 
        if (dataType === 'schedules'){ 
            for (const sch of json['gameScheduleInfoList']){
                console.log(`Week Index ${sch['weekIndex']}`); 
                console.log(`ScheduleId ${sch['scheduleId']}`);
            }
        }
        res.sendStatus(200);
    });
});

app.post('/:platform/:leagueId/freeagents/roster', (req, res) => { 
    let body =''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    });
    req.on('end', () => { 
        //console.log('----Free Agents----'); 
        const json = JSON.parse(body)['rosterInfoList']; 
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
            });
        for (player of json) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            // 118 values
            let sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryLength, injuryType,
                intangibleGrade, isActive, isFreeAgent, isOnIr, isOnPracticeSquad, jerseyNum, jukeMoveRating, jumpRating, kickAccRating, kickPowerRating, kickRetRating,
                lBStyleTrait, lastName, leadBlockRating, legacyScore, manCoverRating, passBlockFinesseRating, passBlockPowerRating, passBlockRating, penaltyTrait, physicalGrade,
                playActionRating, playBallTrait, playRecRating, playerBestOvr, playerSchemeOvr, portraitId, posCatchTrait, position, powerMovesRating, predictTrait, presentationId, pressRating, productionGrade, 
                pursuitRating, qBStyleTrait, reSignStatus, releaseRating, rookieYear, rosterId, routeRunDeepRating, routeRunMedRating, routeRunShortRating, runBlockFinesseRating, runBlockPowerRating, 
                runBlockRating, runStyle, scheme, sensePressureTrait, sizeGrade, skillPoints, specCatchRating, speedRating, spinMoveRating, staminaRating, stiffArmRating, strengthRating, stripBallTrait, 
                tackleRating, teamId, teamSchemeOvr, throwAccDeepRating, throwAccMedRating, throwAccRating, throwAccShortRating, throwAwayTrait, throwOnRunRating, throwPowerRating, throwUnderPressureRating, 
                tightSpiralTrait, toughRating, truckRating, weight, yACCatchTrait, yearsPro, zoneCoverRating) VALUES (${player.accelRating}, ${player.age}, ${player.agilityRating}, ${player.awareRating}, ${player.bCVRating},
                ${player.bigHitTrait}, ${player.birthDay}, ${player.birthMonth}, ${player.birthYear}, ${player.blockShedRating}, ${player.breakSackRating}, ${player.breakTackleRating}, ${player.cITRating}, ${player.capHit},
                ${player.capReleaseNetSavings}, ${player.capReleasePenalty}, ${player.carryRating}, ${player.catchRating}, ${player.changeOfDirectionRating}, ${player.clutchTrait}, ${player.college}, ${player.confRating},
                ${player.contractBonus}, ${player.contractLength}, ${player.contractSalary}, ${player.contractYearsLeft}, ${player.coverBallTrait}, ${player.dLBullRushTrait}, ${player.dLSpinTrait}, ${player.dLSwimTrait},
                ${player.desiredBonus}, ${player.desiredLength}, ${player.desiredSalary}, ${player.devTrait}, ${player.draftPick}, ${player.draftRound}, ${player.dropOpenPassTrait}, ${player.durabilityGrade}, ${player.experiencePoints},${player.feetInBoundsTrait},
                ${player.fightForYardsTrait}, ${player.finesseMovesRating}, ${player.firstName}, ${player.forcePassTrait}, ${player.hPCatchTrait}, ${player.height}, ${player.highMotorTrait}, ${player.hitPowerRating}, ${player.homeState},
                ${player.homeTown}, ${player.impactBlockRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIr}, ${player.IsOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
                ${player.kickAccRating}, ${player.kickPowerRating}, ${player.kickRetRating}, ${player.lBStyleTrait}, ${player.lastName}, ${player.leadBlockRating}, ${player.legacyScore}, ${player.manCoverRating}, ${player.passBlockFinesseRating},
                ${player.passBlockPowerRating}, ${player.passBlockRating}, ${player.penaltyTrait}, ${player.physicalGrade}, ${player.playActionRating}, ${player.playBallTrait}, ${player.playRecRating}, ${player.playerBestOvr}, ${player.playerSchemeOvr},
                ${player.portraitId}, ${player.posCatchTrati}, ${player.position}, ${player.powerMovesRating}, ${player.predictTrait}, ${player.presentationId}, ${player.pressRating}, ${player.productionGrade}, ${player.pursuitRating}, 
                ${player.qBStyleTrait}, ${player.reSignStatus}, ${player.releaseRating}, ${player.rookieYear}, ${player.rosterId}, ${player.routeRunDeepRating}, ${player.routeRunMedRating}, ${player.routeRunShortRating}, ${player.runBlockFinesseRating}, ${player.runBlockPowerRating}, ${player.runBlockRating},
                ${player.runStyle}, ${player.scheme}, ${player.sensePressureTrait}, ${player.sizeGrade}, ${player.skillPoints}, ${player.specCatchRating}, ${player.speedRating}, ${player.spinMoveRating}, ${player.staminaRating}, ${player.stiffArmRating},
                ${player.strengthRating}, ${player.stripBallTrait}, ${player.tackleRating}, ${player.teamId}, ${player.teamSchemeOvr}, ${player.throwAccDeepRating}, ${player.throwAccMedRating}, ${player.throwAccRating}, ${player.throwAccShortRating},
                ${player.throwAwayTrait}, ${player.throwOnRunRating}, ${player.throwPowerRating}, ${player.throwUnderPressureRating}, ${player.tightSpiralTrait}, ${player.toughRating}, ${player.truckRating}, ${player.weight}, ${player.yACCatchTrait}, ${player.yearsPro}, ${player.zoneCoverRating})
                ON DUPLICATE KEY UPDATE accelRating=VALUES(accelRating), age=VALUES(age), agilityRating=VALUES(agilityRating), awareRating=VALUES(awareRating), bCVRating=VALUES(bCVRating), blockShedrating=VALUES(blockShedRating), breakSackRating=VALUES(breakSackRating), 
                breakTackleRating=VALUES(breakTackleRating), cITRating=VALUES(cITRating), capHit=VALUES(capHit), capReleaseNetSavings=VALUES(capReleaseNetSavings), carryRating=VALUES(carryRating), catchRating=VALUES(catchRating), changeOfDirectionRating=VALUES(changeOfDirectionRating), confRating=VALUES(confRating), 
                contractBonus=VALUES(contractBonus), contractLength=VALUES(contractLength), contractSalary=VALUES(contractSalary), contractYearsLeft=VALUES(contractYearsLeft), desiredBonus=VALUES(desiredBonus), desiredLength=VALUES(desiredLength),
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr),
                    playerSchemeOvr=VALUES(playerSchemeOvr), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), pursuitRating=VALUES(pursuitRating), 
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
        con.end();
        res.sendStatus(200); 
    })
});

app.post('/:platform/:leagueId/team/:teamId/roster', (req, res) => { 
    let body = '';
    req.on('data', chunk => { 
        body += chunk.toString();
    }); 
    req.on('end', () => { 
       // console.log('---Team Rosters----'); 
        const json = JSON.parse(body)['rosterInfoList'];
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
            });
        for (player of json) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            // 118 values
            let sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryLength, injuryType,
                intangibleGrade, isActive, isFreeAgent, isOnIr, isOnPracticeSquad, jerseyNum, jukeMoveRating, jumpRating, kickAccRating, kickPowerRating, kickRetRating,
                lBStyleTrait, lastName, leadBlockRating, legacyScore, manCoverRating, passBlockFinesseRating, passBlockPowerRating, passBlockRating, penaltyTrait, physicalGrade,
                playActionRating, playBallTrait, playRecRating, playerBestOvr, playerSchemeOvr, portraitId, posCatchTrait, position, powerMovesRating, predictTrait, presentationId, pressRating, productionGrade, 
                pursuitRating, qBStyleTrait, reSignStatus, releaseRating, rookieYear, rosterId, routeRunDeepRating, routeRunMedRating, routeRunShortRating, runBlockFinesseRating, runBlockPowerRating, 
                runBlockRating, runStyle, scheme, sensePressureTrait, sizeGrade, skillPoints, specCatchRating, speedRating, spinMoveRating, staminaRating, stiffArmRating, strengthRating, stripBallTrait, 
                tackleRating, teamId, teamSchemeOvr, throwAccDeepRating, throwAccMedRating, throwAccRating, throwAccShortRating, throwAwayTrait, throwOnRunRating, throwPowerRating, throwUnderPressureRating, 
                tightSpiralTrait, toughRating, truckRating, weight, yACCatchTrait, yearsPro, zoneCoverRating) VALUES (${player.accelRating}, ${player.age}, ${player.agilityRating}, ${player.awareRating}, ${player.bCVRating},
                ${player.bigHitTrait}, ${player.birthDay}, ${player.birthMonth}, ${player.birthYear}, ${player.blockShedRating}, ${player.breakSackRating}, ${player.breakTackleRating}, ${player.cITRating}, ${player.capHit},
                ${player.capReleaseNetSavings}, ${player.capReleasePenalty}, ${player.carryRating}, ${player.catchRating}, ${player.changeOfDirectionRating}, ${player.clutchTrait}, ${player.college}, ${player.confRating},
                ${player.contractBonus}, ${player.contractLength}, ${player.contractSalary}, ${player.contractYearsLeft}, ${player.coverBallTrait}, ${player.dLBullRushTrait}, ${player.dLSpinTrait}, ${player.dLSwimTrait},
                ${player.desiredBonus}, ${player.desiredLength}, ${player.desiredSalary}, ${player.devTrait}, ${player.draftPick}, ${player.draftRound}, ${player.dropOpenPassTrait}, ${player.durabilityGrade}, ${player.experiencePoints},${player.feetInBoundsTrait},
                ${player.fightForYardsTrait}, ${player.finesseMovesRating}, ${player.firstName}, ${player.forcePassTrait}, ${player.hPCatchTrait}, ${player.height}, ${player.highMotorTrait}, ${player.hitPowerRating}, ${player.homeState},
                ${player.homeTown}, ${player.impactBlockRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIr}, ${player.IsOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
                ${player.kickAccRating}, ${player.kickPowerRating}, ${player.kickRetRating}, ${player.lBStyleTrait}, ${player.lastName}, ${player.leadBlockRating}, ${player.legacyScore}, ${player.manCoverRating}, ${player.passBlockFinesseRating},
                ${player.passBlockPowerRating}, ${player.passBlockRating}, ${player.penaltyTrait}, ${player.physicalGrade}, ${player.playActionRating}, ${player.playBallTrait}, ${player.playRecRating}, ${player.playerBestOvr}, ${player.playerSchemeOvr},
                ${player.portraitId}, ${player.posCatchTrati}, ${player.position}, ${player.powerMovesRating}, ${player.predictTrait}, ${player.presentationId}, ${player.pressRating}, ${player.productionGrade}, ${player.pursuitRating}, 
                ${player.qBStyleTrait}, ${player.reSignStatus}, ${player.releaseRating}, ${player.rookieYear}, ${player.rosterId}, ${player.routeRunDeepRating}, ${player.routeRunMedRating}, ${player.routeRunShortRating}, ${player.runBlockFinesseRating}, ${player.runBlockPowerRating}, ${player.runBlockRating},
                ${player.runStyle}, ${player.scheme}, ${player.sensePressureTrait}, ${player.sizeGrade}, ${player.skillPoints}, ${player.specCatchRating}, ${player.speedRating}, ${player.spinMoveRating}, ${player.staminaRating}, ${player.stiffArmRating},
                ${player.strengthRating}, ${player.stripBallTrait}, ${player.tackleRating}, ${player.teamId}, ${player.teamSchemeOvr}, ${player.throwAccDeepRating}, ${player.throwAccMedRating}, ${player.throwAccRating}, ${player.throwAccShortRating},
                ${player.throwAwayTrait}, ${player.throwOnRunRating}, ${player.throwPowerRating}, ${player.throwUnderPressureRating}, ${player.tightSpiralTrait}, ${player.toughRating}, ${player.truckRating}, ${player.weight}, ${player.yACCatchTrait}, ${player.yearsPro}, ${player.zoneCoverRating})
                ON DUPLICATE KEY UPDATE accelRating=VALUES(accelRating), age=VALUES(age), agilityRating=VALUES(agilityRating), awareRating=VALUES(awareRating), bCVRating=VALUES(bCVRating), blockShedrating=VALUES(blockShedRating), breakSackRating=VALUES(breakSackRating), 
                breakTackleRating=VALUES(breakTackleRating), cITRating=VALUES(cITRating), capHit=VALUES(capHit), capReleaseNetSavings=VALUES(capReleaseNetSavings), carryRating=VALUES(carryRating), catchRating=VALUES(catchRating), changeOfDirectionRating=VALUES(changeOfDirectionRating), confRating=VALUES(confRating), 
                contractBonus=VALUES(contractBonus), contractLength=VALUES(contractLength), contractSalary=VALUES(contractSalary), contractYearsLeft=VALUES(contractYearsLeft), desiredBonus=VALUES(desiredBonus), desiredLength=VALUES(desiredLength),
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr),
                    playerSchemeOvr=VALUES(playerSchemeOvr), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), pursuitRating=VALUES(pursuitRating), 
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
        con.end();
        res.sendStatus(200);
    });
});

app.listen(app.get('port'), ()=>{ 
    console.log('Running on part', app.get('port'));
});
