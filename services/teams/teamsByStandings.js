import teamsByStandingsQuery from '../../db/teams/teamsByStandingsQuery'


// Runs the query for each team sent by the API
export const teamsByStandings = (teams) => {
    for (const team of teams) { 
        teamsByStandingsQuery(team);
    }
}

export default teamsByStandings;