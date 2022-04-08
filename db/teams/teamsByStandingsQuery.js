import { dbConfig } from "../../utils"
import mysql from 'mysql2/promise'; 
import { generateTeamSeasonStatsId } from "../../utils";


/*
    The "basic" team information is stored in the teams_temp table and the seasonal data is stored in team_season_stats; 
*/
export const teamsByStandingsQuery = async (team) => {
    let con = await mysql.createConnection(dbConfig); 
    try {
        con.query(
            `INSERT INTO teams_temp (conferenceId, conferenceName, divisionId, divisionName, teamName, teamId)
            VALUES
            (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY 
            UPDATE teamId=VALUES(teamId), conferenceId=VALUES(conferenceId), divisionId=VALUES(divisionId), divisionName=VALUES(divisionName), teamName=VALUES(teamName)
            `
            ,[team.conferenceId, team.conferenceName, team.divisionId, team.divisionName,team.teamName, team.teamId]);  

            
            let statId = generateTeamSeasonStatsId(team.teamId, team.seasonIndex); 
           
            con.query(
                `INSERT INTO team_season_stats 
                  (awayWins, awayLosses, awayTies, calendarYear, confLosses, confTies, confWins, capRoom, capAvailable, capSpent, defPassYds, defPassYdsRank, defRushYds, 
                    defRushYdsRank, defTotalYds, defTotalYdsRank, divLosses, divTies, divWins, homeLosses, homeTies, homeWins, netPts, offPassYds, offPassYdsRank, offRushYds, offRushYdsRank, 
                    offTotalYds, offTotalYdsRank, ptsAgainstRank, ptsForRank, playoffStatus, prevRank, ptsAgainst, ptsFor, teamRank, seed, seasonIndex, stageIndex, totalLosses, totalTies, totalWins, 
                    teamOvr, tODiff, tOTakeaways, tOGiveaways, weekIndex, winLossStreak, winPct, ovrRating, infoId, teamId)
                VALUES 
                 (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?) 
                ON DUPLICATE KEY UPDATE
                 awayWins=VALUES(awayWins), awayLosses=VALUES(awayLosses), awayTies=VALUES(awayTies), confLosses=VALUES(confLosses), confTies=VALUES(confTies), confWins=VALUES(confWins), capRoom=VALUES(capRoom),
                 capAvailable=VALUES(capAvailable), capSpent=VALUES(capSpent), defPassYds=VALUES(defPassYds), defPassYdsRank=VALUES(defPassYdsRank), defRushYds=VALUES(defRushYds), defRushYdsRank=VALUES(defRushYdsRank),
                 defTotalYds=VALUES(defTotalYds), defTotalYdsRank=VALUES(defTotalYdsRank), divLosses=VALUES(divLosses), divTies=VALUES(divTies), divWins=VALUES(divWins), homeLosses=VALUES(homeLosses), homeTies=VALUES(homeTies), 
                 homeWins=VALUES(homeWins), netPts=VALUES(netPts), offPassYds=VALUES(offPassYds), offPassYdsRank=VALUES(offPassYdsRank), offRushYds=VALUES(offRushYds), offRushYdsRank=VALUES(offRushYdsRank), offTotalYds=VALUES(offTotalYds),
                 offTotalYdsRank=VALUES(offTotalYdsRank), ptsAgainstRank=VALUES(ptsAgainstRank), ptsForRank=VALUES(ptsForRank), playoffStatus=VALUES(playoffStatus), prevRank=VALUES(prevRank), ptsAgainst=ptsAgainst+VALUES(ptsAgainst),
                 ptsFor=ptsFor+VALUES(ptsFor), teamRank=VALUES(teamRank), seed=VALUES(seed), stageIndex=VALUES(stageIndex), totalLosses=VALUES(totalLosses), totalTies=VALUES(totalTies), totalWins=VALUES(totalWins), teamOvr=VALUES(teamOvr),
                 tODiff=VALUES(tODiff), tOTakeaways=VALUES(tOTakeaways), tOGiveaways=VALUES(tOGiveaways), weekIndex=VALUES(weekIndex), winLossStreak=VALUES(winLossStreak), winPct=VALUES(winPct), ovrRating=VALUES(ovrRating), infoId=VALUES(infoId), teamId=VALUES(teamId)
                `, [team.awayWins, team.awayLosses, team.awayTies, team.calendarYear, team.confLosses, team.confTies, team.confWins, team.capRoom, team.capAvailable, team.capSpent, team.defPassYds, team.defPassYdsRank, team.defRushYds, team.defRushYdsRank, team.defTotalYds, 
                    team.defTotalYdsRank, team.divLosses, team.divTies, team.divWins, team.homeLosses, team.homeTies, team.homeWins, team.netPts, team.offPassYds, team.offPassYdsRank, team.offRushYds, team.OffRushYdsRank, team.offTotalYds, team.offTotalYdsRank, 
                    team.ptsAgainstRank,team.ptsForRank, team.playoffStatus, team.prevRank, team.ptsAgainst, team.ptsFor, team.rank, team.seed, team.seasonIndex, team.stageIndex, 
                    team.totalLosses, team.totalTies, team.totalWins, team.teamOvr, team.tODiff,team.tOTakeaways, team.tOGiveaways, team.weekIndex, team.winLossStreak, team.winPct, team.ovrRating, statId, team.teamId])

    }catch (err) {
        console.log(err); 
        con.end(); 
        return false;   
    }

                
                
    
}
export default teamsByStandingsQuery;