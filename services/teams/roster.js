import rostersQuery from "../../db/teams/rostersQuery";


/*
    Runs the rosterQuery for each player on the roster
*/

export const roster = async (players) => {
    for (const player of players) {
        let success = await rostersQuery(player);
        if (!success) {
            return false; 
        }    
    }

    if (success){
        return true;
    }

}

export default roster;