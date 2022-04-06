import { divisionStandingsQuery } from "../../db/teams/divisionStandingsQuery";

export const divisionStandingsService = async (divisionName, seasonIndex) => {

    let result = await divisionStandingsQuery(divisionName, seasonIndex); 
    
    if (result) {
        /*
            WinLossStreak underflows when the team is on a losing streak. This checks to see if the winLossStreak is greater than the possible
             best winning streak of a season and then subtracts it from 256 and makes it negative to show a losing streak
        */
        for (let team of result) {
            if (team.winLossStreak > 22){
                team.winLossStreak = (256 - team.winLossStreak) * -1; 
            }
        }

    }
    return result;

}