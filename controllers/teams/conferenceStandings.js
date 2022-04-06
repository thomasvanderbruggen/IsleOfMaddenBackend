import { conferenceStandingsService } from "../../services/teams/conferenceStandingsService";


/*
    Handles the conferenceStandings GET request
*/ 
export const conferenceStandings = async (req, res) => {
    let seasonIndex = req.app.locals.settings.currentSeason;
    let {params: {conference}, } = req;
    let result = await conferenceStandingsService(conference, seasonIndex,); 

    if (result) {
        res.json(result);
    }else{
        res.sendStatus(500);
    }
}

export default conferenceStandings; 