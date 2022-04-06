
import gamestats from '../../services/gamestats'

/*
    Handles the gamestats GET request
*/
export const statsById = async (req, res) => {
    let {params: {gameId}, } = req;
    gameId = parseInt(gameId); 

    let result = await gamestats.statsById(gameId); 
    if (result) {
        res.send(result); 
    }else{
        res.sendStatus(500); 
    }

}

export default statsById;