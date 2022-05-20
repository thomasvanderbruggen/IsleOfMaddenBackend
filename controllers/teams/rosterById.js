import teamRosterService from "../../services/teams/teamRosterService";


/*
    Handles the team roster GET request
*/
export const rosterById = async (req, res) => {
    let {params: {teamId}, } = req;
    teamId = parseInt(teamId); 

    let result = await teamRosterService(teamId); 

    if (result){
        res.json(result)
    }else {
        res.sendStatus(500); 
    }

}
export default rosterById; 