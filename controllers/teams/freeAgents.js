import { realLeagueId } from "../../utils";
import teams from "../../services/teams";

export const freeAgents = async (req, res) => {
    let { params: { leagueId }, } = req;
    let body = '';
    leagueId = parseInt(leagueId); 

    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        if (leagueId === realLeagueId){ 
            const json = JSON.parse(body)['rosterInfoList']; 
            const pool = req.app.locals.settings.pool; 
            let success = teams.freeAgents(json);
           
            if (success){
                res.sendStatus(200); 
            }else{
                res.sendStauts(500); 
            }
        }
    })
    
} 

export default freeAgents;