import { teamByNameTeamQuery } from "../../db/teams/teamByNameTeamQuery";
import { teamRosterQuery } from "../../db/teams/teamRosterQuery";
import { teamByNameCoachQuery } from "../../db/teams/teamByNameCoachQuery";
import { teamStatsQuery } from "../../db/teams/teamStatsQuery";
import { teamScheduleQuery } from "../../db/teams/teamScheduleQuery";


/*
    Runs all of the different queries to gather all of the given team's information
*/
export const teamByNameService = async (teamName, teamId, seasonIndex) => {
    
    let teamInfo = teamByNameTeamQuery(teamName, seasonIndex);
    let coachInfo = teamByNameCoachQuery(teamName);
    let teamStats = teamStatsQuery(teamId, seasonIndex)
    let teamRoster = teamRosterQuery(teamId);
    let teamSchedule = teamScheduleQuery(teamId, seasonIndex); 


    const result = {
        'teamInfo': await teamInfo, 
        'coach': await coachInfo, 
        'teamStats': await teamStats,
        'roster': await teamRoster,
        'schedule': await teamSchedule

    }

    return result;
}