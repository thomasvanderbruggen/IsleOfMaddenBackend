import { realLeagueId } from "../../utils";
import teams from "../../services/teams";
import weekly from "../../services/weekly";



/*
    Parses data from the weeklystats POST Requests. Checks the dataType paramater in the request to determine what data the applicaton is receiving and calls the service pertaining to that dataType
*/
export const weeklyStats = async (req, res) => {
    let {params : {dataType, weekType, leagueId}, } = req; 
    leagueId = parseInt(leagueId); 
    let body = ''; 
    req.on('data', chunk => {
        body += chunk.toString(); 
    })

    req.on('end',  async () => {
        let success;
        if (leagueId === realLeagueId){
            const pool = req.app.locals.settings.pool; 
            let json = JSON.parse(body); 
            if (dataType === 'teamstats'){ // Contains team stats for each game played
                let stats = json['teamStatInfoList']; 
                success = teams.teamWeeklyStats(stats, weekType, pool);
            }else if (dataType === 'schedules'){ // Contains the scheduling information for the week
                let games = json['gameScheduleInfoList']; 
                success = weekly.schedule(games, weekType);
            }else if (dataType === 'punting'){ // Contains punting stats for each game played
                let stats = json['playerPuntingStatInfoList']; 
                console.log('in request handler for punts'); 
                
                success == weekly.punting(stats, weekType);
            }else if (dataType === 'passing'){ // Contains passing stats fro each game played
                let stats = json['playerPassingStatInfoList'];
                success = weekly.passing(stats, weekType);  
            }else if (dataType === 'defense'){// Contains defensive stats fro each game played
                let stats = json['playerDefensiveStatInfoList']; 
                success = weekly.defense(stats, weekType);
            }else if(dataType === 'kicking'){// Contains kicking stats fro each game played
                let stats = json['playerKickingStatInfoList']; 
                success = weekly.kicking(stats, weekType); 
            }else if(dataType === 'rushing'){// Contains rushing stats fro each game played
                let stats = json['playerRushingStatInfoList']; 
                success = weekly.rushing(stats, weekType); 
            }else if (dataType === 'receiving'){// Contains receiving stats fro each game played
                let stats = json['playerReceivingStatInfoList']; 
                success = weekly.receiving(stats, weekType);
            }
        }

        if (success){
            res.sendStatus(200); 
        }else {
            res.sendStatus(500); 
        }
    })


}

export default weeklyStats;