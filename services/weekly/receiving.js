import receivingQuery from '../../db/weekly/receivingQuery'; 
import { adjustId } from "../../utils";
import { generatePlayerIdWithFullName } from "../../utils";


/*
    Adjusts weekIndex, scheduleId, statId, and generates playerId. Runs receivingQuery for each stat. 
*/
export default receiving = async (stats, weekType) => {
    for (const stat of stats) {
        stat.weekIndex++; 
        stat.scheduleId = adjustId(stat.scheduleId, stat.seasonIndex); 
        if (weekType === 'pre'){
            stat.weekIndex += 23; 
        }
        stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId); 
        stat.statId = adjustId(stat.statId, stat.seasonIndex); 

        let success = await receivingQuery(stat); 

        if (!success){
            return false;
        }
    }   
    return true;
}