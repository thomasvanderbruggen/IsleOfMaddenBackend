import leagueLeadersService from "../../services/players/leagueLeadersService";

export const leagueLeaders = async (req, res) => {
    const seasonIndex = req.app.locals.settings.currentSeason;
    
    let result = await leagueLeadersService(seasonIndex); 

    if (result){
        res.json(result);
    }else {
        res.sendStatus(500); 
    }
}