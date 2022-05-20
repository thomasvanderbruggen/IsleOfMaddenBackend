import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';



/*
    Retrieves the game's score and the top defensive, passing, receiving, and rushing players from that particular game as indicated by the game's scheduleId value
*/ 
export const gameStatsByIdQuery = async (gameId) => {
    let con = await mysql.createConnection(dbConfig);

    try {
        let [game, gameFields] = await con.query(
            `SELECT awayTeamId, homeTeamId, awayScore, homeScore 
            FROM schedules
            WHERE scheduleId = ?
            `, [gameId])

        let [defensiveStats, defensiveStatsFields] = await con.query(
            `SELECT defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs, defTotalTackles, fullName, teamId
                FROM defensive_stats
                WHERE scheduleId = ? and (defSacks > 1 or defInts >= 1 or defTDs >= 1 or defForcedFum >= 1 or defTotalTackles >= 5)  
                `, [gameId])

        let [passingStats, passingStatsFields] = await con.query(
            `SELECT passAtt, passComp, passInts, passLongest, passerRating, passTDs, passYds, fullName
                FROM passing_stats
                WHERE scheduleId = ?
                `, [gameId])

        let [receivingStats, receivingStatsFields] = await con.query(
            `SELECT re.recCatches, re.recLongest, re.recYds, re.recTDs, re.fullName, re.teamId, ru.rushFum
                FROM receiving_stats re
                 LEFT JOIN rushing_stats ru on re.playerId = ru.playerId and re.scheduleId = ru.scheduleId
                WHERE re.scheduleId = ? and (re.recCatches > 3 or re.recYds > 30 or re.recTDs >= 1)
                `, [gameId])

        let [rushingStats, rusingStatsFields] = await con.query(
            `SELECT rushAtt, rushLongest, rushFum, rushYds, rushTDs, fullName, teamId
                FROM rushing_stats 
                WHERE scheduleId = ? and (rushAtt > 8 or rushYds > 25 or rushFum >= 1)
                `, [gameId])

        return {
            game,
            'defenseNotables': defensiveStats,
            'passing': passingStats,
            'receiving': receivingStats,
            'rushing': rushingStats
        }

    } catch (err) {
        console.log('Game Stats Query');
        console.log(err);
        con.end();
        return false;
    }


}

export default gameStatsByIdQuery; 