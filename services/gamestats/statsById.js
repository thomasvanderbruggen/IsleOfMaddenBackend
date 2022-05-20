import gameStatsByIdQuery from '../../db/gamestats/gameStatsByIdQuery'; 

/*
    Runs the gameStatsByIdQuery
*/

export const statsById = async (gameId) => {
    let results = await gameStatsByIdQuery(gameId); 

    return results; 
}

export default statsById; 