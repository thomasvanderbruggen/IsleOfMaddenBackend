import rostersQuery from "../../db/teams/rostersQuery";

export const freeAgents = async (freeAgents, pool) => {
    for (const player of freeAgents) {
        let success = rostersQuery(player, pool);
        if (!success) {
            return false; 
        }    
    }

    if (success){
        return true;
    }

}

export default freeAgents;