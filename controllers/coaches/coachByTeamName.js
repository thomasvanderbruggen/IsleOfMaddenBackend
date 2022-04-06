import { realLeagueId } from "../../utils";
import coaches from "../../services/coaches";



/*
    Handles the /api/coach/:teamName GET Request
*/
export const coachByTeamName = async (req, res) => {
    let {params: {teamName}, } = req;

    let result = await coaches.coachByTeamName(teamName); 

    if (result) {
        res.send(result); 
    }else {
        res.sendStatus(400); 
    }

}

export default coachByTeamName;