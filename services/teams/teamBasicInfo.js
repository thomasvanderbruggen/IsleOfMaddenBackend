import teamBasicInfoQuery from "../../db/teams/teamBasicInfoQuery"


//For each team in the json object, insert/update the database
export const teamBasicInfo = async (teams) => {
    for (const team of teams) { 
        let success = await teamBasicInfoQuery(team);
        if (!success){
            return false;
        } 
    }
    return true;
}

export default teamBasicInfo;