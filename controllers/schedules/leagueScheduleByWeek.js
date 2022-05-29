import leagueScheduleService from "../../services/schedules/leagueScheduleService";



/*
    Handles the leagueSchedule request where a specific week is requested instead of the current week of the league (leagueSchedule.js)
*/
export const leagueScheduleByWeek = async (req, res) => {
    let {params: {week}, } = req; 
    const currentSeason = req.app.locals.settings.currentSeason; 
    week = parseInt(week); 
    console.log(`lsbw ${currentSeason}`)
    let response = await leagueScheduleService(currentSeason, week); 

    if (response){
        res.json(response);
    }else {
        res.sendStatus(500); 
    }

}

export default leagueScheduleByWeek; 