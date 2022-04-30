import teams from "../../services/teams";
import { realLeagueId } from "../../utils";


/*
    Parses teams' rosters and free agents from the POST request. 
*/
export const roster = async (req, res) => {
    let { params: { leagueId }, } = req;
    let body = '';
    leagueId = parseInt(leagueId); 
    req.on('data', chunk => {
        body += chunk.toString();
        console.log('in roster'); 
    }); 
    req.on('end', async () => {
        if (leagueId === realLeagueId) {
          const json = JSON.parse(body)['rosterInfoList'] 
          const pool = req.app.locals.settings.pool; 
         
          let success = teams.roster(json, pool); 
          
          if (success){
              res.sendStatus(200); 

          }
        }
    })
}

export default roster;