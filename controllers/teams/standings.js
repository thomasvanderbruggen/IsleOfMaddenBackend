import { realLeagueId } from "../../utils";
import teams from "../../services/teams";


/*
    Parses information sent from the Madden Companion App. The data sent is a combination of basic information
     like what conference the team is in, the current calendar year in the league, etc. Seasonal information based on the teams is also included 
     such as Wins/Losses/Ties separated into groups (away/home/total/division/conference), the amount of points scored by the team/against the team in that season, and
     that team's current playoff status, and how that team ranks in the league in various categories (How good their defense/offense is at passing or running, etc)
*/

export const standings = async (req, res) => {
    //Get LeagueID from URL
    let { params: { leagueId }, } = req;
    leagueId = parseInt(leagueId); 
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    }); 

    req.on('end', async () => {
        //Verify LeagueID is as expected, and insert into database
        if (leagueId === realLeagueId){
            const inputTeams = JSON.parse(body)['teamStandingInfoList']; 
            const pool = req.app.locals.settings.pool; 
            let success = teams.teamsByStandings(inputTeams, pool);
            if (success){
                res.sendStatus(200);
            }else{
                res.sendStatus(500);
            }
        }
    })

}
export default standings;