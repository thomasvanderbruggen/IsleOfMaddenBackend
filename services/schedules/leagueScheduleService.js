import { leagueScheduleQuery } from "../../db/schedules/leagueScheduleQuery";


/*
Verifies seasonIndex and weekIndex are valid values and then runs the leagueScheduleQuery
*/ 

export const leagueScheduleService = async (seasonIndex, weekIndex) => {
    
    if (seasonIndex < 0){
        return false; 
    }
    /*
        Maximum week is 26 (preseason week 3) 
         and week 22 is the Pro Bowl game which is not sent by the Madden API
    */
    if (weekIndex < 0 || weekIndex > 26 || weekIndex === 22) {
        return false;
    }
    console.log(`lss ${seasonIndex}`)
    return await leagueScheduleQuery(seasonIndex, weekIndex); 
}

export default leagueScheduleService; 