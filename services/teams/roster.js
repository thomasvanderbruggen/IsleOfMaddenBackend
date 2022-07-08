import rostersQuery from "../../db/teams/rostersQuery";
import mysql from 'mysql2'; 
import { dbConfig } from "../../utils";

/*
    Runs the rosterQuery for each player on the roster
*/

export const roster = async (players, pool) => {
    let success; 
    for (const player of players) {
        if (player.firstName == 'Chris'){
            console.log(`${player.firstName} ${player.lastName} ${player.teamId}`);
        }
        success = rostersQuery(player, pool);
        if (!success) {
            return false; 
        }
           
    }

    if (success){
        return true;
    }

}

export default roster;