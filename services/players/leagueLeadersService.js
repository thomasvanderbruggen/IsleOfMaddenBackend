import qbLeadersQuery from "../../db/players/qbLeadersQuery";
import { hbLeadersQuery } from "../../db/players/hbLeadersQuery";
import { recLeadersQuery } from "../../db/players/recLeadersQuery";
import { tackleLeadersQuery } from "../../db/players/tackleLeadersQuery";
import { intLeadersQuery } from "../../db/players/intLeadersQuery";
import { fumbleLeadersQuery } from "../../db/players/fumbleLeadersQuery";
import { fgLeadersQuery } from "../../db/players/fgLeadersQuery";

/*
    Runs the different queries to gather the top players of the given stat (defensive players) or position (offensive players)
*/


export const leagueLeadersService = async (seasonIndex) => {

    let qbs = qbLeadersQuery(seasonIndex); 
    let hbs = hbLeadersQuery(seasonIndex); 
    let receivers = recLeadersQuery(seasonIndex); 
    let tackleLeaders = tackleLeadersQuery(seasonIndex); 
    let intLeaders = intLeadersQuery(seasonIndex); 
    let fumbleLeaders = fumbleLeadersQuery(seasonIndex); 
    let fgLeaders = fgLeadersQuery(seasonIndex); 

    let response = {
        'passing': await qbs,
        'rushing': await hbs,
        'receiving': await receivers,
        'tackle': await tackleLeaders,
        'int': await intLeaders,
        'forcedfum': await fumbleLeaders,
        'fieldgoal': await fgLeaders
    }

    return response;
}

export default leagueLeadersService;