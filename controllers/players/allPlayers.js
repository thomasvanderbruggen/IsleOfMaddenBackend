import { allPlayersService } from "../../services/players/allPlayersService"


/*
    Handles the allPlayers request
*/
export const allPlayers = async (req, res) => {
    let players = await allPlayersService(); 
    if (players) {
        res.json(players);
    }else {
        res.sendStatus(500); 
    }
}

export default allPlayers;