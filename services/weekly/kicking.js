import kickingQuery from "../../db/weekly/kickingQuery";
import { adjustId, generatePlayerIdWithFullName } from "../../utils";

/*
    Adjusts weekIndex, scheduleId, statId. Generates playerId. Runs kickingQuery
*/  

export const kicking = async (stats, weekType) => {
    for (let stat of stats){
        stat.weekIndex++; 
        stat.scheduleId = adjustId(stat.scheduleId, stat.seasonIndex); 
        stat.statId = adjustId(stat.statId, stat.seasonIndex); 
        
        if (weekType === 'pre'){
            stat.weekIndex += 23; 
        }

        stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId); 

        let success = await kickingQuery(stat); 

        if (!success){
            return false;
        }
    }

    return true;
}

export default kicking;