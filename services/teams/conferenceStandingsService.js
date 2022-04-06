import { conferenceStandingsQuery } from "../../db/teams/conferenceStandingsQuery";

export const conferenceStandingsService = async (conferenceName, seasonIndex) => {

    let result = await conferenceStandingsQuery(conferenceName, seasonIndex); 

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

    return {
        'standings': result
    }; 
}