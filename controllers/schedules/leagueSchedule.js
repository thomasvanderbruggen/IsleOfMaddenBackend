import schedules from "../../services/schedules";


/*
    Handles the general leagueSchudle GET request, a leagueSchedule Request for a specific week is in leagueScheduleByWeek.js 
*/

export const leagueSchedule = async (req, res) => {
    const weekIndex = req.app.locals.settings.currentWeek; 
    const seasonIndex = req.app.locals.settings.currentSeason;
    console.log(`SI ${seasonIndex}`)
    let response = await schedules.leagueScheduleService(seasonIndex, weekIndex); 
    console.log(response);

    if (response) {
        res.json(response);
    }else {
        res.sendStatus(500);
    }



}


export default leagueSchedule; 