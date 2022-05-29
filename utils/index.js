import { teamIdQuery } from "../db/util/teamIdQuery";

/*
    Madden re-uses the scheduleIds and statIds (543414514 for example) so 
    to save previous game history it is necessary to add 10000 for every
    season past season 1 to ensure no overwrites occur. 
*/
export const adjustId = (scheduleId, seasonIndex) => {
    return scheduleId + (10000 * seasonIndex);
}


/*
    Same idea as adjustId, but renamed for clarity
*/
export const generateTeamSeasonStatsId = (teamId, seasonIndex) => {
    return teamId + (10000 * seasonIndex);
}

/* 
    Generates a fully unique ID to give to each player to be able to store
        their post-retirement stats. Cannot just use the in-game "rosterId" as that
        gets re-used after a player retires. 
        
    It converts the players first initial and their entire last name to ASCII code characters,
        then it adds the given rosterId to the end of that string.
*/
export const generatePlayerIdWithFirstName = (firstName, lastName, rosterId) => {
    let output = `${firstName.charCodeAt(0)}`;
    for (let i = 0; i < lastName.length; i++) {
        output += `${lastName.charCodeAt(i)}`
    }
    output += `${rosterId}`;
    return output;
}

/*
    Same thing as above but sometimes Madden sends the name in the "Full Name" variant. 
        'John Doe' for example is 'J. Doe' in the "Full Name" style. 
*/


export function generatePlayerIdWithFullName(fullName, rosterId) {
    let output = `${fullName.charCodeAt(0)}`;
    const lastName = fullName.slice(2);
    for (let i = 0; i < lastName.length; i++) {
        output += `${lastName.charCodeAt(i)}`;
    }
    output += `${rosterId}`;
    return output;
}

export const realLeagueId = 1332570;

export const dbConfig = {
    "host": process.env.host,
    "user": process.env.user,
    "password": process.env.pw,
    "database": "isle_of_madden"
}

export const generateTeamIdConversions = async () => {
    let sqlResponse = await teamIdQuery(); 
    let teamIdToName = {}; 
    let teamNameToId = {}; 
    for (const team of sqlResponse) {
        teamIdToName[team.teamId] =  team.teamName;
        teamNameToId[team.teamName] = team.teamId; 
    }
    return [teamIdToName, teamNameToId]
}

export const getCalendarYearFromIndex = (seasonIndex) => {
    return seasonIndex + 2021; 
}

export const calculatePasserRating = (stats) => {
    let a = (stats.passCompPct - 30) * .05; 
    let b = (stats.passYdsPerAtt - 3) * .25; 
    let c = (stats.passTDs / stats.passAttempts) * 100 * .2;
    if (c > 2.375) c = 2.375;  
    let d = 2.375 - (stats.ints / stats.passAttempts * 100) * .25;
    return (a + b + c + d) / 6 * 100;  
}

export default {
    adjustId,
    generateTeamSeasonStatsId,
    generatePlayerIdWithFirstName,
    generatePlayerIdWithFullName,
    realLeagueId, 
    dbConfig,
    getCalendarYearFromIndex
}