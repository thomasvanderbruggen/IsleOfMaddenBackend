import { teamRankQuery } from "../../db/teams/teamRankQuery";


export const rankService = async (seasonIndex) => {
    let result = await teamRankQuery(seasonIndex); 
    
    return result;
}