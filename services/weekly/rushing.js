import passingQuery from "../../db/weekly/passingQuery";
import { adjustId } from "../../utils";
import { generatePlayerIdWithFullName } from "../../utils";
import rushingQuery from '../../db/weekly/rushingQuery'; 

/*
    Adjusts weekIndex, scheduleId, statId. Generates playerId. Runs rushingQuery
*/  

export const rushing = async (stats, weekType) => {
    for (let stat of stats){
        stat.weekIndex++; 
        stat.scheduleId = adjustId(stat.scheduleId, stat.seasonIndex); 
        if (weekType === 'pre'){
            stat.weekIndex += 23; 
        }
        stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId); 

        stat.statId = adjustId(stat.statId, stat.seasonIndex); 
        let success= await rushingQuery(stat); 
        
        if(!success){
            return false; 
        }
    }
    return true;
}

export default rushing;