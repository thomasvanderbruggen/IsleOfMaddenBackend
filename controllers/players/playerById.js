import { playerByIdService } from "../../services/players/playerByIdService";


/*
    Handles the player GET Request
*/
export const playerById = async (req, res) => {
    let {params: {playerId}, } = req;
    let seasonIndex = req.app.locals.settings.currentSeason;
    let teamIdToName = req.app.locals.settings.teamIdToName; 
    let result = await playerByIdService(playerId, seasonIndex, teamIdToName);
    
    if (result){
        res.json(result); 
    }else{
        res.sendStatus(500);
    }
}