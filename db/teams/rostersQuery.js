import mysql from 'mysql2/promise'; 
import utils, { generatePlayerIdWithFirstName } from '../../utils';


/*
    Inserts a player (or updates that player) in the db 
    if a player is a free agent (i.e. the player.teamId value is 0 from the Madden API)
     change it to one for our DB
    
    If more than one player is inserted/updated at a time throw an error, 
     if there is an error, return false
*/

export const rostersQuery = async (player, pool) => {
    if (!player.teamId || player.teamId === 0){
        player.teamId = 1; 
    }
    player['playerId'] =  generatePlayerIdWithFirstName(player.firstName, player.lastName, player.rosterId); 
    try {
        pool.query(
            `INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating,
                 breakSackRating, breakTackleRating, cITRating, capHit, capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, 
                 changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, 
                 coverBallTrait, dLBullRushTrait, dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, 
                 draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait, finesseMovesRating, 
                 firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, 
                 injuryRating, injuryLength, injuryType, intangibleGrade, isActive, isFreeAgent, isOnIr, isOnPracticeSquad, jerseyNum, 
                 jukeMoveRating, jumpRating, kickAccRating, kickPowerRating, kickRetRating, lBStyleTrait, lastName, leadBlockRating, legacyScore, 
                 manCoverRating, passBlockFinesseRating, passBlockPowerRating, passBlockRating, penaltyTrait, physicalGrade, playActionRating, 
                 playBallTrait, playRecRating, playerBestOvr, playerId, playerSchemeOvr, portraitId, posCatchTrait, position, powerMovesRating, 
                 predictTrait, presentationId, pressRating, productionGrade, pursuitRating, qBStyleTrait, reSignStatus, releaseRating, rookieYear, 
                 rosterId, routeRunDeepRating, routeRunMedRating, routeRunShortRating, runBlockFinesseRating, runBlockPowerRating, runBlockRating, 
                 runStyle, scheme, sensePressureTrait, sizeGrade, skillPoints, specCatchRating, speedRating, spinMoveRating, staminaRating, 
                 stiffArmRating, strengthRating, stripBallTrait, tackleRating, teamId, teamSchemeOvr, throwAccDeepRating, throwAccMedRating, 
                 throwAccRating, throwAccShortRating, throwAwayTrait, throwOnRunRating, throwPowerRating, throwUnderPressureRating, tightSpiralTrait,
                  toughRating, truckRating, weight, yACCatchTrait, yearsPro, zoneCoverRating, isRetired)
            VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 0)
            ON DUPLICATE KEY UPDATE 
            accelRating=VALUES(accelRating), age=VALUES(age), agilityRating=VALUES(agilityRating), 
            awareRating=VALUES(awareRating), bCVRating=VALUES(bCVRating), blockShedrating=VALUES(blockShedRating), 
            breakSackRating=VALUES(breakSackRating), breakTackleRating=VALUES(breakTackleRating), cITRating=VALUES(cITRating), 
            capHit=VALUES(capHit), capReleaseNetSavings=VALUES(capReleaseNetSavings), carryRating=VALUES(carryRating), catchRating=VALUES(catchRating), 
            changeOfDirectionRating=VALUES(changeOfDirectionRating), confRating=VALUES(confRating), contractBonus=VALUES(contractBonus), 
            contractLength=VALUES(contractLength), contractSalary=VALUES(contractSalary), contractYearsLeft=VALUES(contractYearsLeft), 
            desiredBonus=VALUES(desiredBonus), desiredLength=VALUES(desiredLength), desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), 
            durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), 
            impactBlockRating=VALUES(impactBlockRating), injuryRating=VALUES(injuryRating), injuryLength=VALUES(injuryLength), 
            injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), 
            isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum), jukeMoveRating=VALUES(jukeMoveRating), 
            jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), 
            kickRetRating=VALUES(kickRetRating), leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), 
            manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), 
            passBlockPowerRating=VALUES(passBlockPowerRating), passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade),
             playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr), 
             playerId=VALUES(playerId), playerSchemeOvr=VALUES(playerSchemeOvr), posCatchTrait=VALUES(posCatchTrait), position=VALUES(position), 
             powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), 
             pursuitRating=VALUES(pursuitRating), reSignStatus=VALUES(reSignStatus), releaseRating=VALUES(releaseRating), routeRunDeepRating=VALUES(routeRunDeepRating), 
             routeRunMedRating=VALUES(routeRunMedRating), routeRunShortRating=VALUES(routeRunShortRating), runBlockFinesseRating=VALUES(runBlockFinesseRating), runBlockPowerRating=VALUES(runBlockPowerRating), 
             runBlockRating=VALUES(runBlockRating), runStyle=VALUES(runStyle), scheme=VALUES(scheme), sizeGrade=VALUES(sizeGrade), skillPoints=VALUES(skillPoints), specCatchRating=VALUES(specCatchRating), speedRating=VALUES(speedRating), spinMoveRating=VALUES(spinMoveRating), staminaRating=VALUES(staminaRating), stiffArmRating=VALUES(stiffArmRating), strengthRating=VALUES(strengthRating), tackleRating=VALUES(tackleRating), teamId=VALUES(teamId), teamSchemeOvr=VALUES(teamSchemeOvr), throwAccDeepRating=VALUES(throwAccDeepRating), throwAccMedRating=VALUES(throwAccMedRating), throwAccRating=VALUES(throwAccRating), throwAccShortRating=VALUES(throwAccShortRating), throwOnRunRating=VALUES(throwOnRunRating), throwPowerRating=VALUES(throwPowerRating), 
             throwUnderPressureRating=VALUES(throwUnderPressureRating), toughRating=VALUES(toughRating), truckRating=VALUES(truckRating), weight=VALUES(weight), yACCatchTrait=VALUES(yACCatchTrait), yearsPro=VALUES(yearsPro), zoneCoverRating=VALUES(zoneCoverRating), isRetired = 0` 
        , [player.accelRating, player.age, player.agilityRating, player.awareRating, player.bCVRating, player.bigHitTrait, player.birthDay, 
            player.birthMonth, player.birthYear, player.blockShedRating, player.breakSackRating, player.breakTackleRating, player.cITRating, 
            player.capHit, player.capReleaseNetSavings, player.capReleasePenalty, player.carryRating, player.catchRating, player.changeOfDirectionRating, 
            player.clutchTrait, player.college, player.confRating, player.contractBonus, player.contractLength, player.contractSalary, 
            player.contractYearsLeft, player.coverBallTrait, player.dLBullRushTrait, player.dLSpinTrait, player.dLSwimTrait, player.desiredBonus, 
            player.desiredLength, player.desiredSalary, player.devTrait, player.draftPick, player.draftRound, player.dropOpenPassTrait, 
            player.durabilityGrade, player.experiencePoints,player.feetInBoundsTrait, player.fightForYardsTrait, player.finesseMovesRating, 
            player.firstName, player.forcePassTrait, player.hPCatchTrait, player.height, player.highMotorTrait, player.hitPowerRating, player.homeState,
             player.homeTown, player.impactBlockRating,player.injuryRating, player.injuryLength, player.injuryType, player.intangibleGrade, 
             player.isActive, player.isFreeAgent, player.isOnIR, player.isOnPracticeSquad, player.jerseyNum, player.jukeMoveRating, player.jumpRating, 
             player.kickAccRating, player.kickPowerRating, player.kickRetRating, player.lBStyleTrait, player.lastName, player.leadBlockRating, 
             player.legacyScore, player.manCoverRating, player.passBlockFinesseRating, player.passBlockPowerRating, player.passBlockRating, 
             player.penaltyTrait, player.physicalGrade, player.playActionRating, player.playBallTrait, player.playRecRating, player.playerBestOvr, 
             player.playerId, player.playerSchemeOvr, player.portraitId, player.posCatchTrait, player.position, player.powerMovesRating, 
             player.predictTrait, player.presentationId, player.pressRating, player.productionGrade, player.pursuitRating, player.qBStyleTrait, 
             player.reSignStatus, player.releaseRating, player.rookieYear, player.rosterId, player.routeRunDeepRating, player.routeRunMedRating, 
             player.routeRunShortRating, player.runBlockFinesseRating, player.runBlockPowerRating, player.runBlockRating, player.runStyle, player.scheme,
              player.sensePressureTrait, player.sizeGrade, player.skillPoints, player.specCatchRating, player.speedRating, player.spinMoveRating, 
              player.staminaRating, player.stiffArmRating, player.strengthRating, player.stripBallTrait, player.tackleRating, player.teamId, 
              player.teamSchemeOvr, player.throwAccDeepRating, player.throwAccMidRating, player.throwAccRating, player.throwAccShortRating, 
              player.throwAwayTrait, player.throwOnRunRating, player.throwPowerRating, player.throwUnderPressureRating, player.tightSpiralTrait, 
              player.toughRating, player.truckRating, player.weight, player.yACCatchTrait, player.yearsPro, player.zoneCoverRating])
        
    
    }catch (err){
        console.log(err); 
        con.end();
        return false; 
    }
    

}

export default rostersQuery;