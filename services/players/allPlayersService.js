import allPlayersQuery from '../../db/players/allPlayersQuery'; 

export const allPlayersService = async() => {
    return await allPlayersQuery(); 
}

export default allPlayersService;