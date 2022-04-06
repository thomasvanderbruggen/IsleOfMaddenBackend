import rostersQuery from "../../db/teams/rostersQuery";

export const freeAgents = async (freeAgents) => {
    for (const player of freeAgents) {
        let success = await rostersQuery(player);
        if (!success) {
            return false; 
        }    
    }

    if (success){
        return true;
    }

}

export default freeAgents;