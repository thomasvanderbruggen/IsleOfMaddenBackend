import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';

export const playerByIdInfoQuery = async (playerId) => {
    const con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT
                p.playerId,
                p.position,
                p.firstName,
                p.lastName,
                p.playerBestOvr,
                p.height,
                p.weight,
                p.jerseyNum,
                p.contractSalary,
                p.contractLength,
                p.contractBonus,
                p.contractYearsLeft,
                p.teamId,
                p.speedRating,
                p.strengthRating,
                p.agilityRating,
                p.accelRating,
                p.jumpRating,
                p.awareRating,
                p.staminaRating,
                p.injuryRating,
                p.toughRating,
                p.changeOfDirectionRating,
                p.throwPowerRating,
                p.throwAccShortRating,
                p.throwAccMedRating,
                p.throwOnRunRating,
                p.throwAccDeepRating,
                p.playActionRating,
                p.breakSackRating,
                p.catchRating,
                p.specCatchRating,
                p.cITRating,
                p.routeRunShortRating,
                p.routeRunMedRating,
                p.routeRunDeepRating,
                p.releaseRating,
                p.breakTackleRating,
                p.truckRating,
                p.stiffArmRating,
                p.spinMoveRating,
                p.jukeMoveRating,
                p.bCVRating,
                p.manCoverRating,
                p.zoneCoverRating,
                p.pressRating,
                p.tackleRating,
                p.hitPowerRating,
                p.pursuitRating,
                p.playRecRating,
                p.passBlockRating,
                p.passBlockPowerRating,
                p.runBlockRating,
                p.runBlockFinesseRating,
                p.passBlockFinesseRating,
                p.runBlockPowerRating,
                p.leadBlockRating,
                p.impactBlockRating,
                p.powerMovesRating,
                p.finesseMovesRating,
                p.blockShedRating,
                p.kickPowerRating,
                p.kickAccRating,
                t.teamName
            FROM 
                players p
                LEFT JOIN teams_temp t on t.teamId = p.teamId
            WHERE 
                p.playerId = ?
            `, [playerId])
        con.end();
        return rows[0];
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
}

export default playerByIdInfoQuery;