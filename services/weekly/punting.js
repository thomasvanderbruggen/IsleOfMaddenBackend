import puntingQuery from '../../db/weekly/puntingQuery'; 
import { generatePlayerIdWithFullName } from '../../utils';
import { adjustId } from '../../utils';



/*
    Adjusts weekIndex, scheduleId, and statId. Generates the playerId for the player that the stat is from. Runs the puntingQuery. 
*/
export const punting = async (stats, weekType) => {
    console.log('in punting service'); 
     for (let stat of stats) {
        stat.weekIndex++; 
        stat.scheduleId = adjustId(stat.scheduleId, stat.seasonIndex); 
        stat.statId = adjustId(stat.statId, stat.seasonIndex); 
        if (weekType === 'pre'){
            stat.weekIndex += 23; 
        }
        stat['playerId'] = generatePlayerIdWithFullName(stat.fullName, stat.rosterId); 

        let success = await puntingQuery(stat); 
        if(!success){
            return false;
        }

     }
     return true;
}


export default punting;