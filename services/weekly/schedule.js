import scheduleQuery from "../../db/weekly/scheduleQuery";
import { adjustId } from "../../utils";


/*
    Adjusts the weekIndex, and scheduleId and runs the scheduleQuery for each game provided by the API
*/ 
export const schedule = async (games, weekType) => {
    console.log(games[0]);
    for (let game of games) { 
        game.weekIndex++; 
        if (game.weekType === 'pre'){
            game.weekIndex += 23; 
        }
        game.scheduleId = adjustId(game.scheduleId, game.seasonIndex);

        let success = await scheduleQuery(game); 

        if (!success){
            return false; 
        }
    }

    return true;
}

export default schedule;