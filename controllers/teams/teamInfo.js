import { realLeagueId } from "../../utils";
import teams from "../../services/teams";


/*
    Parses information from post request to be used to insert "basic" team information like
     the team's ID number,team name, city name, display name, the team's colors, and what division they're in 
*/
export const teamInfo = async (req, res) => {
    //get LeagueId from url
    
    let { params: { leagueId }, } = req;
    leagueId = parseInt(leagueId); 
    let body = '';
    

    req.on('data', chunk => {
        body += chunk.toString();
    })
    req.on('end', () => {
        //Verify leagueId is the expected one, and send to teamBasicInfo
        if (leagueId === realLeagueId) {
            const inputTeams = JSON.parse(body)['leagueTeamInfoList'];
            const pool = req.app.locals.settings.pool; 
            let success = teams.teamBasicInfo(inputTeams, pool); 
            if (success){
                res.sendStatus(200); 
            }else{
                res.sendStatus(500);
            }

        }
    })

}

export default teamInfo;