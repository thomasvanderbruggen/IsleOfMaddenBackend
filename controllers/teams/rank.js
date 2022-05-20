import { rankService } from "../../services/teams/rankService";


/*
    Handles the standings GET Request
*/

export const rank = async (req, res) => {
    let seasonIndex = req.app.locals.settings.currentSeason; 

    let result = await rankService(seasonIndex); 

    if (result){
        res.json(result); 
    }else{
        res.sendStatus(500); 
    }
}

export default rank;