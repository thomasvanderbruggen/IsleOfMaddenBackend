import { searchService } from "../../services/players/searchService"

/*
    Handles the playersearch get request. 
    Position, team, and name are all optional values to search by
*/
export const search = async (req, res) => {
    console.log(req.app.locals.settings); 
    const result = await searchService(req.query.position, req.query.team, req.query.name, req.app.locals.settings.teamIdToName); 

    if (result) {
        res.json(result); 
    }else{
        res.sendStatus(500); 
    }
}