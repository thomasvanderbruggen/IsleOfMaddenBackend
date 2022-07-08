import rostersQuery from "../../db/teams/rostersQuery";
import mysql from 'mysql2'; 
import { dbConfig } from "../../utils";

/*
    Runs the rosterQuery for each player on the roster
*/

export const roster = async (players, pool) => {
    let success; 
    for (const player of players) {
        success = rostersQuery(player, pool);
        if (!success) {
            return false; 
        }
        console.log(`${player.firstName} ${player.lastName} ${player.teamId}`)   
    }

    if (success){
        return true;
    }

}

export default roster;