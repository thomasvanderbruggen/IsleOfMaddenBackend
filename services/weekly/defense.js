import { adjustId, generatePlayerIdWithFullName } from "../../utils";
import defenseQuery from "../../db/weekly/defenseQuery";

/*
    Adjusts weekIndex, scheduleId, statId. Generates playerId. Runs defenseQuery
*/  

export const defense = async (stats, weekType) => {
    for (let stat of stats) {
        stat.weekIndex++; 
        stat.scheduleId = adjustId(stat.scheduleId, stat.seasonIndex); 
        stat.statId = adjustId(stat.scheduleId, stat.seasonIndex); 
        stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId);

        let success = await defenseQuery(stat); 

        if (!success){
            return false;
        }

    }

    return true;
}
export default defense;