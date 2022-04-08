import teamsByStandingsQuery from '../../db/teams/teamsByStandingsQuery'


// Runs the query for each team sent by the API
export const teamsByStandings = async (teams) => {
    for (const team of teams) { 
        let success= await teamsByStandingsQuery(team); 
        if (!success){
            return false;
        }
    }
    return true;
}

export default teamsByStandings;