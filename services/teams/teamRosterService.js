import { teamRosterQuery } from "../../db/teams/teamRosterQuery";

export const teamRosterService = async (teamId) => {
    let result = await teamRosterQuery(teamId);
    
    return result; 
}

export default teamRosterService; 