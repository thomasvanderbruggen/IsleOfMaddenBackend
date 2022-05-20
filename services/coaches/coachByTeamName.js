import coachByTeamNameQuery from "../../db/coaches/coachByTeamNameQuery";


/*
    Runs the coachByTeamNameQuery and validates there is just one result
*/
export const coachByTeamName = async (teamName) => {
    let result = await coachByTeamNameQuery(teamName); 

    if (result.length === 1){
        return result[0]; 
    }

    return false;
}

export default coachByTeamName;