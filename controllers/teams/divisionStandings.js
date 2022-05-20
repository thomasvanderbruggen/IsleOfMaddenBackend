import { divisionStandingsService } from "../../services/teams/divisionStandingsService";

export const divisionStandings = async (req, res) => {
    let {pramas: {division}, } = req;
    let seasonIndex = req.app.locals.settings.currentSeason; 

    let result = await divisionStandingsService(division, seasonIndex); 

    if (result){ 
        res.json(result); 
    }else{
        res.sendStatus(500); 
    }


}

export default divisionStandings; 