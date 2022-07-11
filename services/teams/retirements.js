import allIds from "../../db/players/allIds";
import utils from "../../utils";
import handleRetirees from "../../db/players/handleRetirees";

/*
    If a player is no longer on the team they were on between the Super Bowl 
     and the offseason they can be considered retired. 
     
    Gets all of the IDs from the players on the current team. Then, it generates a playerId 
     for all incoming players, then removes all of the playerIds of the incoming (ie still playing)
     players. All playerIds remaining inside of allIds will be marked in the DB.   
*/

export const retirements = async (players) => {
    if (players[0].teamId === 0){
        players[0].teamId = 1; 
    }
    let currentPlayers = await allIds(players[0].teamId); 

    for (let player of players) { 
        player['playerId'] =  utils.generatePlayerIdWithFirstName(player.firstName, player.lastName, player.rosterId); 
        const index = currentPlayers.indexOf(player.playerId); 

        


        if (index !== -1){
            currentPlayers.splice(index, 1); 
        }
    }

    let success = handleRetirees(currentPlayers); 

    return success;

}
export default retirements;