import { searchQuery } from "../../db/players/searchQuery";




/*
    Generates the sql statement and runs the query. After the query, it adds a new field to each object to store the player's team's name 
*/
export const searchService = async (position, team, name, teamIdToName) => {
    let select = buildSelect(position); 
    let [where, values] = buildWhere(position, team, name); 
    let sql = select + ' FROM players ' + where + ' ORDER BY CONCAT(lastName, firstName);'
    let result = await searchQuery(sql, values); 
    if (result) {
        for (let player of result){
            player['teamName'] = teamIdToName[player.teamId]; 
        }
    }
    console.log(result); 
    return result;
    
}

/*
    Builds the select statement based on the position.  
*/
const buildSelect = (position) => {
    let commonColumns = "firstName, lastName, devTrait, age, height, weight, playerBestOvr, teamId, position, playerId"
     if (!position || position === "Any"){ 
        return `SELECT ${commonColumns}, speedRating, awareRating`; 
     }else if (position === 'QB') {
         return `SELECT ${commonCols}, throwPowerRating, throwAccRating, throwOnRunRating, throwAccShortRating, throwAccMedRating, throwAccDeepRating, speedRating, awareRating, playActionRating, breakSackRating, throwUnderPressureRating`;
     }else if (position === "HB"){ 
        return  `SELECT ${commonCols}, awareRating, speedRating, strengthRating, agilityRating, truckRating, jukeMoveRating, changeOfDirectionRating, spinMoveRating, stiffArmRating, carryRating, breakTackleRating, accelRating, bCVRating`; 
    }else if (position === "FB"){ 
        return  `SELECT ${commonCols}, carryRating, impactBlockRating, leadBlockRating, runBlockRating, strengthRating, speedRating, truckRating, accelRating, agilityRating, catchRating, stiffArmRating, passBlockRating, breakTackleRating`; 
    }else if(position === "TE"){ 
        return  `SELECT ${commonCols}, speedRating, catchRating, cITRating, specCatchRating, routeRunShortRating, routeRunMedRating, routeRunDeepRating, jumpRating, runBlockRating, impactBlockRating, passBlockRating, leadBlockRating, awareRating, breakTackleRating`; 
    }else if (position === "WR"){
        return  `SELECT ${commonCols}, speedRating, accelRating, routeRunShortRating, routeRunMedRating, routeRunDeepRating, catchRating, cITRating,  specCatchRating, jumpRating, releaseRating, agilityRating`; 
    }else if(position === "LT" || position === "LG" || position === "C" || position === "RG" || position === "RT" || position === "OL") { 
        return  `SELECT ${commonCols}, strengthRating, runBlockRating, runBlockPowerRating, runBlockFinesseRating, runBlockRating, passBlockRating, passBlockPowerRating, passBlockFinesseRating, leadBlockRating, impactBlockRating, awareRating, position`; 
    }else if (position === "LE" || position === "RE"){ 
        return  `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating, agilityRating`; 
    }else if (position == "DT") {
        return  `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating`;
    }else if (position === "LOLB"  || position === "ROLB"){ 
        return  `SELECT ${commonCols}, speedRating, tackleRating, powerMovesRating, finesseMovesRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, hitPowerRating, blockShedRating, awareRating, strengthRating`; 
    }else if (position === "MLB" || position === "LB") { 
        return  `SELECT ${commonCols}, speedRating, tackleRating, hitPowerRating, strengthRating, powerMovesRating, finesseMovesRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, blockShedRating, awareRating`
    }else if (position === "CB") { 
        return  `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pressRating, hitPowerRating, catchRating, agilityRating, jumpRating, tackleRating`; 
    }else if (position === "SS"  || position === "FS"){
        return  `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pursuitRating, tackleRating, hitPowerRating, catchRating, agilityRating, blockShedRating`;
    }else if (position === "K"  || position === "P" || position === "ST") { 
        return  `SELECT ${commonCols}, kickPowerRating, kickAccRating, awareRating, speedRating, accelRating, strengthRating, throwPowerRating, throwAccShortRating, agilityRating, position`; 
    }else if (position === "DL") { 
        return  `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating, agilityRating, position`;
    }else if (position === "LB") {
        return  `SELECT ${commonCols}, speedRating, tackleRating, powerMovesRating, finesseMovesRating, hitPowerRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, hitPowerRating, blockShedRating, awareRating, strengthRating, position`;
    }else if (position === "DB"){ 
        return  `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pressRating, pursuitRating, hitPowerRating, tackleRating, agilityRating, jumpRating, tackleRating, blockShedRating, position`;
    }
}


/*
    Builds the where statement based on values sent in the request
*/
const buildWhere = (position, team, name) => {
    let haveFirstParam = false; 
    let sql = '';
    let values = []; 
    if (position === "OL") { 
        sql +=  " WHERE position = 'LT' or position = 'LG' or position = 'C' or position = 'RG' or position = 'RT'"; 
        haveFirstParam = true;
    }else if (position === "DL") {
        sql += " WHERE position = 'RE' or position = 'DT' or position = 'LE'"; 
        haveFirstParam = true;
    }else if (position === "LB") { 
        sql += " WHERE position = 'LOLB' or position = 'MLB' or position = 'ROLB'"; 
        haveFirstParam = true;
    }else if (position === "DB"){ 
        sql += " WHERE position = 'CB' or position = 'FS' or position = 'SS'"; 
        haveFirstParam = true;
    }else if (position === "ST") { 
        sql += " WHERE position = 'K' or position = 'P'"; 
        haveFirstParam = true;
    }else if (position && position != "Any"){ 
        sql += " WHERE";
        sql += ` position=?`;
        values.push(position);
        haveFirstParam = true; 
    }
    

    if (team && team != 'Any' && haveFirstParam) {
        sql += ` and teamId=?`
        values.push(team); 
    }else if (team && team != 'Any' && !haveFirstParam){
        sql += `WHERE teamId=?`
        values.push(team); 
        haveFirstParam = true;
    }

    if (name && haveFirstParam){
        sql += ` and CONCAT(UPPER(firstName), ' ', UPPER(lastName)) LIKE ?`
        values.push(`%${name}%`); 
    }else if (name && !haveFirstParam){
        sql += `WHERE CONCAT(UPPER(firstName), ' ', UPPER(lastName)) LIKE ?`; 
        values.push(`%${name}%`); 
    }
    return [sql, values]; 
}