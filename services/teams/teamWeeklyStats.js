import utils from "../../utils"
import teamWeeklyStatsQuery from "../../db/teams/teamWeeklyStatsQuery";



/*
    Modifies the weekIndex, scheduleId, and weekIndex (weekIndex is only modified due to wanting to be able to more easily separate preseason and regular/postseason games. 
     Week 1 of preseason is weekIndex 24 and week 2 of preseason is weekIndex 25 and so on. 
    
    Runs the teamWeeklyStatsQuery for each stat provided from the API
*/
export const teamWeeklyStats = async (stats, weekType) => {
    for (let stat of stats) {
        stat.weekIndex++
        stat.scheduleId = utils.adjustId(stat.scheduleId, stat.seasonIndex);
        if (weekType === 'pre'){
            stat.weekIndex += 23;
        }
        const pool = req.app.locals.settings.pool; 
        let success = teamWeeklyStatsQuery(stat, pool); 
        if (!success){
            return false;
        }
    }

    return true; 
}

export default teamWeeklyStats;