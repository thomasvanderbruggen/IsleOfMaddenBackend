import { realLeagueId } from "../../utils";
import teams from "../../services/teams";


/*
    Parses teams' rosters and free agents and sends it to the teams.retirement function
*/
export const retirements = async (req, res) => {
    let { params: { leagueId }, } = req;
    let body = '';
    leagueId = parseInt(leagueId); 

    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        if (leagueId === leagueId){ 
            const json = JSON.parse(body)['rosterInfoList']; 
            let success = await teams.retirements(json);
            
            if (success){
                res.sendStatus(200); 
            }else{
                res.sendStatus(500); 
            }
        }
    })
}
export default retirements;