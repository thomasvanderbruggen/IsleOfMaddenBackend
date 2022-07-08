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
        if (player.firstName === 'Chris' && player.lastName === 'Streveler') {
            console.log(player);
        }     
    }

    if (success){
        return true;
    }

}

export default roster;