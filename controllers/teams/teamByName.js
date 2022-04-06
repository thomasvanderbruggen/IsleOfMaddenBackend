import { teamByNameService } from "../../services/teams/teamByNameService";


/*
    Handles the team GET request. Converts the given team name to the proper casing. (e.g. 'cardinals' -> 'Cardinals', 'CARDINALS' -> 'Cardinals')

*/
export const teamByName = async (req, res) => {
    let {params: {teamName}, } = req;

    teamName = teamName.charAt(0).toUpperCase() + teamName.slice(1); 
    const seasonIndex = req.app.locals.settings.currentSeason;
    const teamId = req.app.locals.settings.teamNameToId[teamName]; 
    let result = await teamByNameService(teamName, teamId, seasonIndex);
    console.log(teamId);
    if (result){
        res.json(result); 
    }else {

    }
}

export default teamByName;