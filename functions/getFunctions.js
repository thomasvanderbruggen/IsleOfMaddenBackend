const mysql = require('mysql');
const {teamNameToId} = require('../resources/teamNameToId.json');
const {teamIdToName} = require('../resources/teamIdToName.json');
const SQL = require('sql-template-strings');

const connectionGenerator = () => {
   let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    return con;  
}

function calculatePasserRating (stats) { 
    let a = (stats.passCompPct - 30) * .05; 
    let b = (stats.passYdsPerAtt - 3) * .25; 
    let c = (stats.passTDs / stats.passAttempts) * 100 * .2;
    if (c > 2.375) c = 2.375;  
    let d = 2.375 - (stats.ints / stats.passAttempts * 100) * .25;
    return (a + b + c + d) / 6 * 100;  
}


const coaches = (res) =>{
    let con = connectionGenerator();
    con.query('select coachName, teamName from coaches', (err, sqlRes) => {
        if (err) res.sendStatus(500); 
        else {
            res.send(sqlRes);
        }
    }); 
    con.end();
}

const teamCoach = (teamName, res) => {
    let con = connectionGenerator();
    con.query('select coachName, teamName from coaches where teamName = ?', [teamName], (err, sqlRes) => {
        if (err) res.sendStatus(500); 
        else { 
            res.send(sqlRes);
        }
    })
    con.end();
}

const gameStats = (gameId, res) => {
    let schedulesDone = false, passingDone = false, rushingDone = false, defDone = false, receivingDone = false, sent = false; 
    let con = connectionGenerator();
    let response = {}; 
    let sql = "select awayTeamId, homeTeamId, awayScore, homeScore from schedules where scheduleId = ? and seasonIndex = 2";
    con.query(sql, [gameId], (err, sqlRes) => {
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        sqlRes[0].awayTeam = teamIdToName[sqlRes[0].awayTeamId]; 
        sqlRes[0].homeTeam = teamIdToName[sqlRes[0].homeTeamId];
        response['game'] = sqlRes;
        schedulesDone = true;
        if (schedulesDone && passingDone && rushingDone && defDone && receivingDone && !sent) { 
            sent = true;
            res.send(response);
        }
    }) 
    sql = "select defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs, defTotalTackles, fullName, teamId from defensive_stats where scheduleId = ? and (defSacks > 1 or defInts >= 1 or defTDs >= 1 or defForcedFum >= 1 or defTotalTackles >=5) and seasonIndex = 2"; 
    con.query(sql, [gameId], (err, sqlRes) => { 
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        response['defenseNotables'] = sqlRes;
        defDone = true;
        if (schedulesDone && passingDone && rushingDone && defDone && receivingDone && !sent) { 
            sent = true;
            res.send(response);
        }
    })
    sql = "select passAtt, passComp, passInts, passLongest, passerRating, passTDs, passYds, fullName, teamId from passing_stats where scheduleId = ? and seasonIndex = 2"; 
    con.query(sql, [gameId], (err, sqlRes) => { 
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        response['passing'] = sqlRes;
        passingDone = true;
        if (schedulesDone && passingDone && rushingDone && defDone && receivingDone && !sent) { 
            sent = true;
            res.send(response);
        }
    })
    sql = "select re.recCatches, re.recLongest, re.recYds, re.recTDs, re.fullName, re.teamId, ru.rushFum from receiving_stats re left join rushing_stats ru on re.rosterId = ru.rosterId and re.scheduleId = ru.scheduleId where re.scheduleId = ? and re.seasonIndex = 2 and (re.recCatches > 3 or re.recYds > 30 or re.recTDs >= 1)"; 
    con.query(sql, [gameId], (err, sqlRes) => {
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        response['receiving'] = sqlRes; 
        receivingDone = true;
        if (schedulesDone && passingDone && rushingDone && defDone && receivingDone && !sent) { 
            sent = true;
            res.send(response);
        }
    })
    sql = "select rushAtt, rushLongest, rushFum, rushYds, rushTDs, fullName, teamId from rushing_stats where scheduleId = ? and seasonIndex = 2 and (rushAtt > 8 or rushYds > 25 or rushFum >= 1)"; 
    con.query(sql, [gameId], (err, sqlRes) => { 
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        response['rushing'] = sqlRes; 
        rushingDone = true; 
        if (schedulesDone && passingDone && rushingDone && defDone && receivingDone && !sent) { 
            sent = true;
            res.send(response);
        }
    })
    con.end();







}

const leagueSchedule = (seasonIndex, weekIndex, res) => {
    let con = connectionGenerator();
    let sql = SQL`select homeTeamId, homeScore, awayTeamId, awayScore, weekIndex, weekStatus, seasonIndex from schedules where seasonIndex = ? and weekIndex = ? order by weekIndex asc`;    
    con.query(sql,[seasonIndex, weekIndex], (err, sqlRes) => {
        if (err) res.sendStatus(500); 
        else {
            // keeps track of which week's games are being processed.
            let week = sqlRes[0].weekIndex; // 1
            // array to hold one week's worth of games, will be pushed to allGames once all of that week's games are processed
            let weeklyGames = []; 
            //2d array to hold all of the games

            for (game of sqlRes) { 
                if (game.homeTeamId === 0) { 
                    game['homeTeam'] = 'TBD';
                }else { 
                    game['homeTeam'] = teamIdToName[game.homeTeamId];
                }
                if (game.awayTeamId === 0) { 
                    game['awayTeam'] = 'TBD';
                }else { 
                    game['awayTeam'] = teamIdToName[game.awayTeamId];
                }
                
            }

            res.send({games: sqlRes, weekIndex}); 
        }
    })
    con.end(); 
}

const allPlayers = (res) => {
    let con = connectionGenerator();

    let sql = 'select pl.firstName, pl.lastName, pl.devTrait, pl.age, pl.height, pl.weight, pl.playerBestOvr, pl.speedRating, pl.awareRating, pl.position, pl.teamId, pl.rosterId, t.teamName from players pl, teams t where pl.teamId = t.teamId order by concat(firstName, lastName) asc;'; 
    con.query(sql, (err, sqlRes) => {
        if (err) res.sendStatus(500); 
        else {
            for (let player of sqlRes){
                player['teamname'] = teamIdToName[player.teamId];
            }
            res.send(sqlRes);
        }
    })
    con.end();
}

const teamByTeamName = (teamName, res) => {
    let teamInfoDone = false, teamCoachDone = false, teamStatsDone = false, teamRosterDone = false, teamSchedules = false, sent = false;
    let response = {};
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    let sql = 'select * from teams where teamName = ?';
    con.query(sql, [teamName], (err, sqlRes) => {
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        response['teamInfo'] = sqlRes;
        teamInfoDone = true;
        if (teamInfoDone && teamCoachDone && teamStatsDone && teamRosterDone && teamSchedules && !sent) { 
            sent = true;
            res.send(response); 
        }
    })
    sql = 'select coachName from coaches where teamName = ?';
    con.query(sql, [teamName], (err, sqlRes) => { 
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        response['coach'] = sqlRes;
        teamCoachDone = true;
        if (teamInfoDone && teamCoachDone && teamStatsDone && teamRosterDone && teamSchedules && !sent) { 
            console.log(`sending: ${response}`);
            sent = true;
            res.send(response); 
        }
    })
    
    sql = 'select * from team_stats where teamId = ? and weekIndex < 23 and seasonIndex = 2 ORDER BY (weekIndex)'; 
    con.query (sql, [teamNameToId[teamName]], (err, sqlRes) => { 
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        response['teamStats'] = sqlRes;
        teamStatsDone = true;
        if (teamInfoDone && teamCoachDone && teamStatsDone && teamRosterDone && teamSchedules && !sent) { 
            console.log(`sending: ${response}`);
            sent = true;
            res.send(response); 
        }
        
    })
    sql = 'select * from players where teamId = ? ORDER BY playerBestOvr desc';   
    con.query(sql, [teamNameToId[teamName]], (err, sqlRes) => { 
        if (err) {
            sent = true;
            res.sendStatus(500); 
        } 
        response['roster'] = sqlRes;
        teamRosterDone = true; 
        if (teamInfoDone && teamCoachDone && teamStatsDone && teamRosterDone && teamSchedules && !sent) { 
            console.log(`sending: ${response}`);
            sent = true;
            res.send(response);
        }
        
    })
    sql = `select * from schedules where weekIndex < 24 and (homeTeamId = ? or awayTeamId = ?) and seasonIndex = 2 order by (weekIndex) asc`; 
    con.query(sql, [teamNameToId[teamName], teamNameToId[teamName]], (err, sqlRes) =>  {
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        for (const week of sqlRes) { 
            if (week.awayTeamId === teamNameToId[teamName]) { 
                week.awayTeam = teamName
            }else { 
                week.awayTeam = teamIdToName[week.awayTeamId];
            }
            if (week.homeTeamId === teamNameToId[teamName]) { 
                week.homeTeam = teamName;
            }else { 
                week.homeTeam = teamIdToName[week.homeTeamId]; 
            }
        }
        response['schedule'] = sqlRes;
        teamSchedules = true;
        if (teamInfoDone && teamCoachDone && teamStatsDone && teamRosterDone && teamSchedules && !sent) {
            console.log('sending');
            console.log(response);
            sent = true; 
            res.send(response);
        }
        
    })
    con.end();  

}


const teamRoster = (teamId, res) => {
    let con = connectionGenerator();
    let sql = 'select * from players where teamId = ?'; 
    con.query(sql, [teamId], (err, sqlRes) => {
        if (err) res.sendStatus(500);
        else { 
            res.send(sqlRes);
        }
    })
    con.end();
}


const seasonStats = (year, position, playerId, res) => {
    // TODO
    //  let con = connectionGenerator();
    
 }

 const playerInfo = (rosterId, res) => {
    let con = connectionGenerator();
    let response = {};
    let sql = 'SELECT p.*, t.primaryColor, t.secondaryColor, t.teamName from players p, teams t where p.teamId = t.teamId and p.rosterId = ?;'; 
    con.query(sql, [rosterId], (err, sqlRes) => { 
        if (err) res.send(404); 
        response['player'] = sqlRes[0];
        let position = sqlRes[0].position;
        if (position === 'qb' || position === 'QB') {
            let secondSql =SQL`SELECT r.rushAtt, r.rushBrokenTackles, r.rushFum, r.rushLongest, r.rushPts, r.rushTDs, r.rushToPct, r.rush20PlusYds, r.rushYds, r.rushYdsPerAtt, r.rushYdsPerGame,p.passAtt, p.passComp,
             p.passCompPct, p.passInts, p.passLongest, p.passPts, p.passerRating, p.passSacks, p.passTDs, p.passYds, p.passYdsPerGame, p.fullName, p.weekIndex, r.teamId, sch.awayTeamId, sch.homeTeamId
            FROM passing_stats p LEFT JOIN rushing_stats r ON p.rosterId = r.rosterId AND p.weekIndex = r.weekIndex AND p.scheduleId = r.scheduleId 
            LEFT JOIN players pl ON pl.rosterID = p.rosterId LEFT JOIN schedules sch ON sch.scheduleId = p.scheduleId WHERE p.rosterId = ${rosterId} AND p.seasonIndex = 2 AND p.weekIndex < 24 ORDER BY (p.weekIndex) ASC;`;
            let seasonStats = {
                "name": '', 
                "rushAttempts": 0, 
                "rushBTackles": 0, 
                "fumbles": 0, 
                "rushLongest": 0, 
                "rushPts": 0, 
                "rushTDs": 0, 
                "rushOver20": 0, 
                "rushYds": 0, 
                "rushYdsPerAtt": 0, 
                "rushYdsPerGame": 0, 
                "passAttempts": 0, 
                "passCompletions": 0, 
                "passCompPct": 0, 
                "ints": 0, 
                "passLongest": 0, 
                "passPts": 0, 
                "passerRating": 0, 
                "passSacks": 0, 
                "passTDs": 0, 
                "passYds": 0, 
                "passYdsPerGame": 0,
                "passYdsPerAtt": 0
            }
            con.query(secondSql, (err, secondQuery) => { 
                if (err) res.sendStatus(500);
                console.log(secondQuery);
                if (secondQuery.length !== 0){
                   
                   let weeklyStats = []; 
                   for (const week of secondQuery) { 
                       seasonStats.name = week.fullName;
                       seasonStats.rushAttempts += week.rushAtt; 
                       seasonStats.rushBTackles += week.rushBrokenTackles; 
                       seasonStats.fumbles += week.rushFum;
                       if (week.rushLongest > seasonStats.rushLongest) seasonStats.rushLongest = week.rushLongest; 
                       seasonStats.rushPts += week.rushPts; 
                       seasonStats.rushTDs += week.rushTDs; 
                       seasonStats.rushYdsPerGame = week.rushYdsPerGame; 
                       seasonStats.passAttempts += week.passAtt; 
                       seasonStats.passCompletions += week.passComp; 
                       seasonStats.ints += week.passInts; 
                       if (week.passLongest > seasonStats.passLongest) seasonStats.passLongest = week.passLongest; 
                       seasonStats.passPts += week.passPts; 
                       seasonStats.passSacks += week.passSacks;
                       seasonStats.passTDs += week.passTDs; 
                       seasonStats.passYds += week.passYds; 
                       seasonStats.passYdsPerGame = week.passYdsPerGame;
                       week.passerRating = +week.passerRating.toFixed(2);
                       if (week.awayTeamId === week.teamId){
                           week['opponent'] = teamIdToName[week.homeTeamId];
                       }
                       if (week.homeTeamId === week.teamId){
                           week['opponent'] = teamIdToName[week.awayTeamId];
                       }
                       delete week.awayTeamId; 
                       delete week.homeTeamId;
                       weeklyStats.push(week);
   
                   }
                   seasonStats.rushYdsPerAtt = seasonStats.rushYds / seasonStats.rushAttempts; 
                   seasonStats.passCompPct = seasonStats.passCompletions / seasonStats.passAttempts * 100; 
                   seasonStats.passYdsPerAtt = seasonStats.passYds / seasonStats.passAttempts;
                   seasonStats.passerRating = calculatePasserRating(seasonStats).toFixed(2);
                   response.seasonStats = seasonStats; 
                   response.weeklyStats = weeklyStats; 
                   res.send(response);
                }else {
                    res.send(response);
                }
                con.end();
            })
    
    
        } else if (position === 'HB' || position === 'hb' || position === 'FB' || position === 'fb'){
            sql = SQL`select ru.fullName, ru.rushAtt, ru.rushBrokenTackles, ru.rushFum, ru.rushLongest, ru.rushPts, ru.rushTDs, ru.rushToPct, ru.rush20PlusYds, 
            ru.rushYds, ru.rushYdsPerAtt, ru.rushYdsPerGame, re.recCatches, re.recCatchPct, re.recDrops, re.recLongest, re.recPts, re.recTDs, 
            re.recToPct, re.recYds, re.recYdsAfterCatch, re.recYdsPerGame, re.weekIndex, ru.teamId, sch.homeTeamId, sch.awayTeamId from rushing_stats ru left join receiving_stats re ON ru.rosterId = re.rosterId and ru.weekIndex = re.weekIndex  and ru.scheduleId = re.scheduleId left join players pl ON pl.rosterId = ru.rosterId left join schedules sch on sch.scheduleId = ru.scheduleId where ru.rosterId = ${rosterId} and re.seasonIndex = 2 and re.weekIndex < 24 order by (ru.weekIndex) asc`; 
            con.query(sql, (err, secondQuery)=> { 
                if (err) res.sendStatus(500) 
                if (secondQuery.length !== 0){
                   let seasonStats = { 
                       "name": '',
                       "rushAttempts": 0, 
                       "rushBrokenTackles": 0, 
                       "fumbles": 0, 
                       "rushLongest": 0, 
                       "rushPts": 0, 
                       "rushTDs": 0, 
                       "rushToPct": 0, 
                       "rush20PlusYds": 0, 
                       "rushYds": 0, 
                       "rushYdsPerAtt": 0, 
                       "rushYdsPerGame": 0, 
                       "recCatches": 0, 
                       "recDrops": 0, 
                       "recLongest": 0, 
                       "recPts": 0, 
                       "recTDs": 0, 
                       "recYds": 0,
                       "recYdsAfterCatch": 0, 
                       "recYdsPerGame": 0, 
                       "recYdsPerCatch": 0
                   }
                   let weeklyStats = []; 
                   for (const week of secondQuery){ 
                       seasonStats.name = week.fullName;
                       seasonStats.rushAttempts += week.rushAtt; 
                       seasonStats.rushBrokenTackles += week.rushBrokenTackles; 
                       seasonStats.fumbles += week.rushFum; 
                       if (seasonStats.rushLongest < week.rushLongest) seasonStats.rushLongest = week.rushLongest; 
                       seasonStats.rushPts += week.rushPts
                       seasonStats.rushTDs += week.rushTDs; 
                       seasonStats.rush20PlusYds += week.rush20PlusYds; 
                       seasonStats.rushYds += week.rushYds; 
                       seasonStats.rushYdsPerGame = week.rushYdsPerGame; 
                       seasonStats.recCatches += week.recCatches; 
                       seasonStats.recDrops += week.recDrops; 
                       if (seasonStats.recLongest < week.recLongest) seasonStats.recLongest = week.recLongest; 
                       seasonStats.recPts += week.recPts; 
                       seasonStats.recTDs += week.recTDs; 
                       seasonStats.recYds += week.recYds;
                       seasonStats.recYdsAfterCatch += week.recYdsAfterCatch; 
                       seasonStats.recYdsPerGame = week.recYdsPerGame;
                       if (week.awayTeamId === week.teamId){
                           week['opponent'] = teamIdToName[week.homeTeamId];
                       }
                       if (week.homeTeamId === week.teamId){
                           week['opponent'] = teamIdToName[week.awayTeamId];
                       }
                       delete week.awayTeamId; 
                       delete week.homeTeamId;
                       weeklyStats.push(week);
                   }
                   seasonStats.rushToPct = seasonStats.fumbles / seasonStats.rushAttempts;
                   seasonStats.rushYdsPerAtt = seasonStats.rushYds / seasonStats.rushAttempts; 
                   if (seasonStats.recCatches > 0){ 
                       seasonStats.recYdsPerCatch = seasonStats.recYds / seasonStats.recCatches;
                   }
                   response.seasonStats = seasonStats; 
                   response.weeklyStats = weeklyStats; 
                   res.send(response);
                }else {
                   res.send(response);
                }
               con.end();
            })
        } else if (position === 'WR' || position === 'wr' || position === 'TE' || position === 'te'){ 
           let seasonStats = { 
                "name": '',
                "recCatches": 0,
                "recCatchPct": 0, 
                "recDrops": 0, 
                "recLongest": 0, 
                "recPts": 0, 
                "recTDs": 0, 
                "recYdsAfterCatch": 0, 
                "recYac": 0, 
                "recYds": 0, 
                "recYdsPerCatch": 0, 
                "recYdsPerGame": 0
            }
            sql = SQL`select re.recCatches, re.recCatchPct, re.recDrops, re.recLongest, re.recPts, re.recTDs, re.recYdsAfterCatch, re.recYacPerCatch, re.recYds, re.recYdsPerCatch, re.recYdsPerGame, re.fullName, re.weekIndex, re.teamId, sch.awayTeamId, sch.homeTeamId from receiving_stats re left join players pl on pl.rosterId = re.rosterId left join schedules sch on sch.scheduleId = re.scheduleId where re.rosterId = ${rosterId} and re.seasonIndex = 2 and re.weekIndex < 24 order by (re.weekIndex) asc`;
            con.query(sql, (err, secondQuery) => { {
                if (err) { 
                   res.sendStatus(500);
                   console.log(err);
                   con.end(); 
               }
                else{
                    if (secondQuery.length !== 0){
                       let weeklyStats = [];  
                       for (const week of secondQuery) {
                           console.log(secondQuery);  
                           seasonStats.recCatches += week.recCatches; 
                           seasonStats.recDrops += week.recDrops; 
                           if (week.recLongest > seasonStats.recLongest) seasonStats.recLongest = week.recLongest; 
                           seasonStats.recPts += week.recPts;
                           seasonStats.recTDs += week.recTDs; 
                           seasonStats.recYdsAfterCatch += week.recYdsAfterCatch; 
                           seasonStats.recYac += (week.recYacPerCatch * week.recCatches); 
                           seasonStats.recYds += week.recYds;
                           if (week.awayTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.homeTeamId];
                           }
                           if (week.homeTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.awayTeamId];
                           }
                           delete week.awayTeamId; 
                           delete week.homeTeamId;
                           weeklyStats.push(week);
                       }
                       seasonStats.recYdsPerGame = sqlRes[0].recYdsPerGame;
                       seasonStats.recYdsPerCatch = (seasonStats.recYds / seasonStats.recCatches); 
                       seasonStats.name = secondQuery[0].fullName;
                       response.weeklyStats = weeklyStats; 
                       response.seasonStats = seasonStats;  
                       res.send(response);
                    }else {
                        res.send(response);
                    }
                    con.end();
                }
    
            }})
        } else if (position === 'DT' || position === 'dt' || position === 'RE' || position === 're' || position === 'LE' || 
        position === 'le' || position === 'LOLB' || position === 'lolb' || position === 'ROLB' || position === 'rolb' || 
        position === 'MLB' || position === 'mlb' || position === 'FS'|| position === 'fs' || position === 'SS' || position === 'ss' || position === 'CB' || 
        position === 'cb' || position === 'def'){
            let seasonStats = {
                "name": '', 
                "defCatchAllowed": 0, 
                "defDeflections": 0, 
                "defForcedFum": 0, 
                "defFumRec": 0,
                "defInts": 0, 
                "defIntReturnYds": 0, 
                "defPts": 0, 
                "defSacks": 0, 
                "defSafeties": 0, 
                "defTDs": 0, 
                "defTotalTackles": 0
            }
            sql = SQL`select def.defCatchAllowed, def.defDeflections, def.defForcedFum, def.defFumRec, def.defInts, def.defIntReturnYds, def.defPts, def.defSacks, def.defSafeties, def.defTDs, def.defTotalTackles, def.fullName, def.weekIndex, def.teamId, sch.awayTeamId, sch.homeTeamId from defensive_stats def left join players pl on pl.rosterId = def.rosterId left join schedules sch on sch.scheduleId = def.scheduleId where def.seasonIndex = 2 and def.rosterId = ${rosterId} and def.weekIndex < 24 order by (def.weekIndex) asc`; 
            con.query(sql, (err, secondQuery) => { 
                if (err) res.sendStatus(500);
                else {
                    if (secondQuery.length !== 0){
                       let weeklyStats = []; 
                       for (const week of secondQuery) { 
                           seasonStats.defCatchAllowed += week.defCatchAllowed; 
                           seasonStats.defDeflections += week.defDeflections; 
                           seasonStats.defForcedFum += week.defForcedFum;
                           seasonStats.defFumRec += week.defFumRec;
                           seasonStats.defInts += week.defInts;
                           seasonStats.defIntReturnYds += week.defIntReturnYds;
                           seasonStats.defPts += week.defPts;
                           seasonStats.defSacks += week.defSacks;
                           seasonStats.defSafeties += week.defSafeties;
                           seasonStats.defTDs += week.defTDs; 
                           seasonStats.defTotalTackles += week.defTotalTackles;
                           if (week.awayTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.homeTeamId];
                           }
                           if (week.homeTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.awayTeamId];
                           }
                           delete week.awayTeamId; 
                           delete week.homeTeamId;
                           weeklyStats.push(week);
                           seasonStats.name = secondQuery[0].fullName;
                       }
                       response.weeklyStats = weeklyStats; 
                       response.seasonStats = seasonStats;
                       res.send(response);
                    }else {
                        res.send(response);
                    }
                    con.end(); 
                }
            })
        } else if (position === 'P' || position === 'p'){ 
            let seasonStats = { 
                "name": '',
                "puntsBlocked": 0, 
                "puntsIn20": 0, 
                "puntLongest": 0, 
                "puntTBs": 0, 
                "puntNetYdsPerAtt": 0, 
                "puntNetYds": 0, 
                "puntAtt": 0, 
                "puntYdsPerAtt": 0, 
                "puntYds": 0, 
                "kickoffAtt": 0, 
                "kickoffTBs": 0
            }
            sql = SQL`select p.puntsBlocked, p.puntsIn20, p.puntLongest, p.puntTBs, p.puntNetYds, p.puntAtt, p.puntYds, p.fullName, k.kickoffAtt, k.kickoffTBs, p.weekIndex, k.teamId, sch.awayTeamId, sch.homeTeamId from punting_stats p left join kicking_stats k ON p.rosterId = k.rosterId and p.scheduleId = k.scheduleId and p.weekIndex = k.weekIndex left join players pl on pl.rosterId = p.rosterId left join schedules sch on sch.scheduleId = p.scheduleId where p.seasonIndex = 2 and p.rosterId = ${rosterId} and p.weekIndex < 24 order by (p.weekIndex) asc`; 
            con.query(sql, (err, secondQuery) => { 
                if (err) {
                    res.sendStatus(500);
                }
                    
                else {
                    if (secondQuery !== 0){
                       let weeklyStats = []; 
                       for (const week of secondQuery) { 
                           seasonStats.puntsBlocked += week.puntsBlocked; 
                           seasonStats.puntsIn20 += week.puntsIn20; 
                           seasonStats.puntLongest += week.puntLongest; 
                           seasonStats.puntTBs += week.puntTBs; 
                           seasonStats.puntNetYds += week.puntNetYds;
                           seasonStats.puntAtt += week.puntAtt;  
                           seasonStats.puntYds += week.puntYds; 
                           seasonStats.kickoffAtt += week.kickoffAtt; 
                           seasonStats.kickoffTBs += week.kickoffTBs;
                           if (week.awayTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.homeTeamId];
                           }
                           if (week.homeTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.awayTeamId];
                           }
                           delete week.awayTeamId; 
                           delete week.homeTeamId;
                           weeklyStats.push(week); 
                       }
                       seasonStats.puntNetYdsPerAtt = seasonStats.puntNetYds / seasonStats.puntAtt; 
                       seasonStats.puntYdsPerAtt = seasonStats.puntYds / seasonStats.puntAtt; 
                       seasonStats.name = secondQuery[0].fullName;
                       response.seasonStats = seasonStats; 
                       response.weeklyStats = weeklyStats; 
                       res.send(response);
                    }else {
                        res.send(response);
                    }
                   con.end();
                }
            })
    
        } else if (position === 'K' || position === 'k') {
            let seasonStats = { 
                "name": 0,
                "kickPts": 0, 
                "fgAtt": 0, 
                "fg50PlusAtt": 0, 
                "fg50PlusMade": 0,
                "fgLongest": 0, 
                "fgMade": 0, 
                "fgCompPct": 0, 
                "kickoffAtt": 0, 
                "kickoffTBs": 0, 
                "xpAtt": 0, 
                "xpMade": 0,
                "xpCompPct": 0
            } 
            sql = SQL`select k.kickPts, k.fGAtt, k.fG50PlusAtt, k.fG50PlusMade, k.fGLongest, k.fGMade, k.kickoffAtt, k.kickoffTBs, k.xPAtt, k.xPMade, k.xPCompPct, k.fullName, k.weekIndex, k.teamId, sch.awayTeamId, sch.homeTeamId from kicking_stats k left join players pl on pl.rosterId = k.rosterId left join schedules sch on sch.scheduleId = k.scheduleId where k.seasonIndex = 2 and rosterId = ${rosterId} and k.weekIndex < 24 order by (weekIndex) asc`;
            con.query(sql, (err, secondQuery) => { 
                if (err) res.sendStatus(500); 
                else {
                    if (secondQuery.length !== 0){
                       let weeklyStats = [];  
                       for (const week of secondQuery) { 
                           seasonStats.kickPts += week.kickPts; 
                           seasonStats.fgAtt += week.fGAtt; 
                           seasonStats.fg50PlusAtt += week.fG50PlusAtt; 
                           seasonStats.fg50PlusMade += week.fG50PlusMade; 
                           if (week.fGlongest > seasonStats.fgLongest) seasonStats.fgLongest = week.fGLongest; 
                           seasonStats.fgMade += week.fGMade; 
                           seasonStats.kickoffAtt += week.kickoffAtt; 
                           seasonStats.kickoffTBs += week.kickoffTBs; 
                           seasonStats.xpAtt += week.xPAtt; 
                           seasonStats.xpMade += week.xPMade;
                           if (week.awayTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.homeTeamId];
                           }
                           if (week.homeTeamId === week.teamId){
                               week['opponent'] = teamIdToName[week.awayTeamId];
                           }
                           delete week.awayTeamId; 
                           delete week.homeTeamId;
                           weeklyStats.push(week);
                       }
                       seasonStats.fgCompPct = seasonStats.fgMade / seasonStats.fgAtt; 
                       seasonStats.xpCompPct = seasonStats.xpMade / seasonStats.xpAtt;
                       seasonStats.name = secondQuery[0].fullName;
                       response.weeklyStats = weeklyStats; 
                       response.seasonStats = seasonStats;
                       res.send(response);
                    }else{
                        res.send(response);
                    }
                    con.end();
                }
            })
        }else { 
            res.send(response);
        }
    })

}

const powerRank = (res) => {
    let con = connectionGenerator();
    let sql = "select cityName, teamName, totalWins, totalLosses, totalTies, primaryColor, secondaryColor from teams where teamId <> 1 order by teamRank ASC;"
    con.query(sql, (err,sqlRes) => {
        if (err) res.sendStatus(500); 
        else{
            res.send(sqlRes);
        }
    })
}

const playerSearch = (position, team, name, res) => {
    let sql;
    let commonCols = "firstName, lastName, devTrait, age, height, weight, playerBestOvr, teamId, position, rosterId";
    let con = connectionGenerator(); 
    if (!position || position == "Any") { 
        sql = `SELECT ${commonCols}, speedRating, awareRating `; 
    }else { 
        if (position === "QB"){ 
            sql = `SELECT ${commonCols}, throwPowerRating, throwAccRating, throwOnRunRating, throwAccShortRating, throwAccMedRating, throwAccDeepRating, speedRating, awareRating, playActionRating, breakSackRating, throwUnderPressureRating`; 
        }else if (position === "HB"){ 
            sql = `SELECT ${commonCols}, awareRating, speedRating, strengthRating, agilityRating, truckRating, jukeMoveRating, changeOfDirectionRating, spinMoveRating, stiffArmRating, carryRating, breakTackleRating, accelRating, bCVRating`; 
        }else if (position === "FB"){ 
            sql = `SELECT ${commonCols}, carryRating, impactBlockRating, leadBlockRating, runBlockRating, strengthRating, speedRating, truckRating, accelRating, agilityRating, catchRating, stiffArmRating, passBlockRating, breakTackleRating`; 
        }else if(position === "TE"){ 
            sql = `SELECT ${commonCols}, speedRating, catchRating, cITRating, specCatchRating, routeRunShortRating, routeRunMedRating, routeRunDeepRating, jumpRating, runBlockRating, impactBlockRating, passBlockRating, leadBlockRating, awareRating, breakTackleRating`; 
        }else if (position === "WR"){
            sql = `SELECT ${commonCols}, speedRating, accelRating, routeRunShortRating, routeRunMedRating, routeRunDeepRating, catchRating, cITRating,  specCatchRating, jumpRating, releaseRating, agilityRating`; 
        }else if(position === "LT" || position === "LG" || position === "C" || position === "RG" || position === "RT" || position === "OL") { 
            sql = `SELECT ${commonCols}, strengthRating, runBlockRating, runBlockPowerRating, runBlockFinesseRating, runBlockRating, passBlockRating, passBlockPowerRating, passBlockFinesseRating, leadBlockRating, impactBlockRating, awareRating, position`; 
        }else if (position === "LE" || position === "RE"){ 
            sql = `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating, agilityRating`; 
        }else if (position == "DT") {
            sql = `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating`;
        }else if (position === "LOLB"  || position === "ROLB"){ 
            sql = `SELECT ${commonCols}, speedRating, tackleRating, powerMovesRating, finesseMovesRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, hitPowerRating, blockShedRating, awareRating, strengthRating`; 
        }else if (position === "MLB" || position === "LB") { 
            sql = `SELECT ${commonCols}, speedRating, tackleRating, hitPowerRating, strengthRating, powerMovesRating, finesseMovesRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, blockShedRating, awareRating`
        }else if (position === "CB") { 
            sql = `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pressRating, hitPowerRating, catchRating, agilityRating, jumpRating, tackleRating`; 
        }else if (position === "SS"  || position === "FS"){
            sql = `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pursuitRating, tackleRating, hitPowerRating, catchRating, agilityRating, blockShedRating`;
        }else if (position === "K"  || position === "P" || position === "ST") { 
            sql = `SELECT ${commonCols}, kickPowerRating, kickAccRating, awareRating, speedRating, accelRating, strengthRating, throwPowerRating, throwAccShortRating, agilityRating, position`; 
        }else if (position === "DL") { 
            sql = `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating, agilityRating, position`;
        }else if (position === "LB") {
            sql = `SELECT ${commonCols}, speedRating, tackleRating, powerMovesRating, finesseMovesRating, hitPowerRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, hitPowerRating, blockShedRating, awareRating, strengthRating, position`;
        }else if (position === "DB"){ 
            sql = `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pressRating, pursuitRating, hitPowerRating, tackleRating, agilityRating, jumpRating, tackleRating, blockShedRating, position`;
        }
    }
    sql += " FROM players"
    if (!position && !team && !name) { 
         
    }else { 
        let haveFirstParam = false; 
        if (position === "OL") { 
            sql +=  " WHERE position = 'LT' or position = 'LG' or position = 'C' or position = 'RG' or position = 'RT'"; 
            haveFirstParam = true;
        }else if (position === "DL") {
            sql += " WHERE position = 'RE' or position = 'DT' or position = 'LE'"; 
            haveFirstParam = true;
        }else if (position === "LB") { 
            sql += " WHERE position = 'LOLB' or position = 'MLB' or position = 'ROLB'"; 
            haveFirstParam = true;
        }else if (position === "DB"){ 
            sql += " WHERE position = 'CB' or position = 'FS' or position = 'SS'"; 
            haveFirstParam = true;
        }else if (position === "ST") { 
            sql += " WHERE position = 'K' or position = 'P'"; 
            haveFirstParam = true;
        }else if (position && position != "Any"){ 
            sql += " WHERE";
            sql += ` position='${position}'`; 
                haveFirstParam = true;
            
        }
        if (team && team != "Any") {
            if (haveFirstParam) { 
                sql += ` and teamId=${team}`; 
            }else { 
                sql += " WHERE";
                sql += ` teamId=${team}`; 
                haveFirstParam = true;
            }
            
        }
        if(name) { 
            if (haveFirstParam) { 
                sql += ` and CONCAT(UPPER(firstName),' ', UPPER(lastName)) LIKE '%${name}%'`; 
            } else { 
                sql += ` WHERE CONCAT(UPPER(firstName),' ', UPPER(lastName)) LIKE '%${name}%'`;
            }
        }
    }
    sql += " ORDER BY CONCAT(lastName, firstName);"; 
    con.query(sql, (err, sqlRes) => {
        console.log(sql);
        console.log(err);
        if (err) {res.send(500);} 
        else {
            for (let player of sqlRes){  
                player['teamName'] = teamIdToName[player.teamId];
            }
            res.send(sqlRes); 
        }
    })
    con.end(); 
}

const standings = (res) => {
    let sql = 'select teamName, teamId, totalWins, totalLosses, totalTies, divWins, divLosses, divTies, confWins, confLosses, confTies, conferenceName, divisionName, ptsFor, ptsAgainst, homeWins, homeLosses, homeTies, awayWins, awayTies, awayLosses, winLossStreak, ROW_NUMBER() OVER (ORDER BY totalWins desc, totalTies desc, confWins desc, divWins desc) as "place" from teams where teamId > 1';
    let con = connectionGenerator();

    let response = {}; 
    con.query(sql, (err, sqlRes) => {
        if (err) throw err;
        response['standings'] = sqlRes;
        sql = 'select awayScore, homeScore, awayTeamId, homeTeamId from schedules where seasonIndex = 2 and (awayScore > 0 and homeScore > 0)'; 
        con.query(sql, (err, scheduleRes) => {
            if (err) throw err;
            let results = {}; 
            console.log(response.standings.length);
            for (const game of scheduleRes) { 
                if (results[game.homeTeamId] === undefined){
                    results[game.homeTeamId] = {}; 
                    results[game.homeTeamId]['ptsFor'] = game.homeScore;
                    results[game.homeTeamId]['ptsAgainst'] = game.awayScore;
                    results[game.homeTeamId]['id'] = game.homeTeamId;
                    console.log(results[game.homeTeamId]);
                }else { 
                    results[game.homeTeamId]['ptsFor'] += game.homeScore;
                    results[game.homeTeamId]['ptsAgainst'] += game.awayScore;
                 }

                if (results[game.awayTeamId] === undefined){
                    results[game.awayTeamId] = {};
                    results[game.awayTeamId]['ptsFor'] = game.awayScore;
                    results[game.awayTeamId]['ptsAgainst'] = game.homeScore;
                    results[game.awayTeamId]['id'] = game.awayTeamId;
                    console.log(results[game.awayTeamId]);  
                }else{
                    results[game.awayTeamId]['ptsFor'] += game.awayScore;
                    results[game.awayTeamId]['ptsAgainst'] += game.homeScore;
                }
            }
            for (const team of response.standings){
                team['ptsFor'] = results[team.teamId]['ptsFor']
                team['ptsAgainst'] = results[team.teamId]['ptsAgainst']
            }
            res.send(response); 
            con.end();
        })
        
    })
    

}

const conferenceStandings = (conference, res) => {
    let sql = 'select teamName, teamId, totalWins, totalLosses, totalTies, divWins, divLosses, divTies, confWins, confLosses, confTies, conferenceName, divisionName, ptsFor, ptsAgainst, homeWins, homeLosses, homeTies, awayWins, awayTies, awayLosses, winLossStreak, ROW_NUMBER() OVER (ORDER BY totalWins desc, totalTies desc, confWins desc, divWins desc) as "place" from teams where teamId > 1 and conferenceName = ?'; 
    let con = connectionGenerator();    
    let response = {}; 
    con.query(sql, [conference], (err, sqlRes) => {
        if (err) throw err; 
        response['standings'] = sqlRes;
        sql = 'select awayScore, homeScore, awayTeamId, homeTeamId from schedules where seasonIndex = 2 and (awayScore > 0 and homeScore > 0)'; 
        con.query(sql, (err, scheduleRes) => {
            if (err) throw err;
            let results = {}; 
            console.log(response.standings.length);
            for (const game of scheduleRes) { 
                if (results[game.homeTeamId] === undefined){
                    results[game.homeTeamId] = {}; 
                    results[game.homeTeamId]['ptsFor'] = game.homeScore;
                    results[game.homeTeamId]['ptsAgainst'] = game.awayScore;
                    results[game.homeTeamId]['id'] = game.homeTeamId;
                    console.log(results[game.homeTeamId]);
                }else { 
                    results[game.homeTeamId]['ptsFor'] += game.homeScore;
                    results[game.homeTeamId]['ptsAgainst'] += game.awayScore;
                 }

                if (results[game.awayTeamId] === undefined){
                    results[game.awayTeamId] = {};
                    results[game.awayTeamId]['ptsFor'] = game.awayScore;
                    results[game.awayTeamId]['ptsAgainst'] = game.homeScore;
                    results[game.awayTeamId]['id'] = game.awayTeamId;
                    console.log(results[game.awayTeamId]);  
                }else{
                    results[game.awayTeamId]['ptsFor'] += game.awayScore;
                    results[game.awayTeamId]['ptsAgainst'] += game.homeScore;
                }
            }
            for (const team of response.standings){
                team['ptsFor'] = results[team.teamId]['ptsFor']
                team['ptsAgainst'] = results[team.teamId]['ptsAgainst']
            }
            res.send(response); 
            con.end();
        })
    })
}

const divisionStandings = (division, res) => {
    let sql = 'select teamName, teamId, totalWins, totalLosses, totalTies, divWins, divLosses, divTies, confWins, confLosses, confTies, conferenceName, divisionName, ptsFor, ptsAgainst, homeWins, homeLosses, homeTies, awayWins, awayTies, awayLosses, winLossStreak, ROW_NUMBER() OVER (ORDER BY totalWins desc, totalTies desc, confWins desc, divWins desc) as "place" from teams where teamId > 1 and divisionName = ?'; 
    let con = connectionGenerator();
    let response = {}; 
    con.query(sql, [division], (err, sqlRes) => {
        if (err) throw err; 
        response['standings'] = sqlRes; 
        sql = 'select awayScore, homeScore, awayTeamId, homeTeamId from schedules where seasonIndex = 2 and (awayScore > 0 and homeScore > 0)'; 
        con.query(sql, (err, scheduleRes) => {
            if (err) throw err;
            let results = {}; 
            console.log(response.standings.length);
            for (const game of scheduleRes) { 
                if (results[game.homeTeamId] === undefined){
                    results[game.homeTeamId] = {}; 
                    results[game.homeTeamId]['ptsFor'] = game.homeScore;
                    results[game.homeTeamId]['ptsAgainst'] = game.awayScore;
                    results[game.homeTeamId]['id'] = game.homeTeamId;
                    console.log(results[game.homeTeamId]);
                }else { 
                    results[game.homeTeamId]['ptsFor'] += game.homeScore;
                    results[game.homeTeamId]['ptsAgainst'] += game.awayScore;
                 }

                if (results[game.awayTeamId] === undefined){
                    results[game.awayTeamId] = {};
                    results[game.awayTeamId]['ptsFor'] = game.awayScore;
                    results[game.awayTeamId]['ptsAgainst'] = game.homeScore;
                    results[game.awayTeamId]['id'] = game.awayTeamId;
                    console.log(results[game.awayTeamId]);  
                }else{
                    results[game.awayTeamId]['ptsFor'] += game.awayScore;
                    results[game.awayTeamId]['ptsAgainst'] += game.homeScore;
                }
            }
            for (const team of response.standings){
                team['ptsFor'] = results[team.teamId]['ptsFor']
                team['ptsAgainst'] = results[team.teamId]['ptsAgainst']
            }
            res.send(response); 
            con.end();
        })
    })
}

const leagueLeaders = (res) => {
        /* 
select fullName, sum(passAtt) "passAtt", sum(passComp) "passComp", sum(passYds) "passYds", sum(passTDs) "passTDs" from passing_stats where seasonIndex = 2 group by playerId order by sum(passYds) desc, sum(passTDs) desc LIMIT 10;
select fullName, sum(rushAtt) "rushAtt", sum(rushYds) "rushYds", sum(rushTDs) "rushTDs", max(rushLongest) "rushLongest" from rushing_stats group by playerId order by sum(rushYds) desc, sum(rushTDs) desc LIMIT 10; 
select fullName, sum(recCatches) "recCatches", sum(recYds) "recYds", sum(recTDs) "recTDs", max(recLongest) "recLongest" from receiving_stats where seasonIndex = 2 group by playerId order by sum(recYds) desc, sum(recTDs) desc LIMIT 10; 
select fullName, sum(defTotalTackles) "defTotalTackles", sum(defForcedFum) "defForcedFum", sum(defSacks) "defSacks" from defensive_stats where seasonIndex = 2 group by playerId order by sum(defTotalTackles) desc, sum(defForcedFum) desc LIMIT 10;
select fullName, sum(defInts) "defInts", sum(defDeflections) "defDeflections", sum(defCatchAllowed) "defCatchAllowed", sum(defTDs) "defTDs" from defensive_stats where seasonIndex = 2 group by playerId order by sum(defInts) desc, sum(defDeflections) desc, sum(defCatchAllowed) asc LIMIT 10;
select fullName, sum(defForcedFum) "defForcedFum", sum(defTotalTackles) "defTackles", sum(defFumRec) "defFumRec", sum(defInts) "defInts" from defensive_stats where seasonIndex = 2 group by playerId order by sum(defForcedFum) desc, sum(defTotalTackles) desc LIMIT 10;
select fullName, sum(fGMade) "fgMade", sum(fGAtt) "fgAtt", sum(xpMade) "xpMade" from kicking_stats where seasonIndex = 2 group by playerId order by sum(fGMade) desc, sum(fgAtt) asc LIMIT 10;
*/
let sql = 'select fullName, sum(passAtt) "passAtt", sum(passComp) "passComp", sum(passYds) "passYds", sum(passTDs) "passTDs" from passing_stats where seasonIndex = 2 and weekIndex < 24 group by playerId order by sum(passYds) desc, sum(passTDs) desc LIMIT 10; select fullName, sum(rushAtt) "rushAtt", sum(rushYds) "rushYds", sum(rushTDs) "rushTDs", max(rushLongest) "rushLongest" from rushing_stats where seasonIndex = 2 and weekIndex < 24 group by playerId order by sum(rushYds) desc, sum(rushTDs) desc LIMIT 10; select fullName, sum(recCatches) "recCatches", sum(recYds) "recYds", sum(recTDs) "recTDs", max(recLongest) "recLongest" from receiving_stats where seasonIndex = 2 and weekIndex < 24 group by playerId order by sum(recYds) desc, sum(recTDs) desc LIMIT 10; select fullName, sum(defTotalTackles) "defTotalTackles", sum(defForcedFum) "defForcedFum", sum(defSacks) "defSacks" from defensive_stats where seasonIndex = 2 and weekIndex < 24 group by playerId order by sum(defTotalTackles) desc, sum(defForcedFum) desc LIMIT 10; select fullName, sum(defInts) "defInts", sum(defDeflections) "defDeflections", sum(defCatchAllowed) "defCatchAllowed", sum(defTDs) "defTDs" from defensive_stats where seasonIndex = 2 and weekIndex < 24 group by playerId order by sum(defInts) desc, sum(defDeflections) desc, sum(defCatchAllowed) asc LIMIT 10; select fullName, sum(defForcedFum) "defForcedFum", sum(defTotalTackles) "defTotalTackles", sum(defFumRec) "defFumRec", sum(defInts) "defInts" from defensive_stats where seasonIndex = 2 and weekIndex < 24 group by playerId order by sum(defForcedFum) desc, sum(defTotalTackles) desc LIMIT 10; select fullName, sum(fGMade) "fgMade", sum(fGAtt) "fgAtt", sum(xpMade) "xpMade" from kicking_stats where seasonIndex = 2 and weekIndex < 24 group by playerId order by sum(fGMade) desc, sum(fgAtt) asc LIMIT 10;'
let con = mysql.createConnection({ 
    "host": process.env.host,
    "user": process.env.user,
    "password": process.env.pw,
    "database": "tomvandy_isle_of_madden",
    multipleStatements: true
});
let response = {}; 

con.query(sql, (err, sqlRes) => {
    if (err) throw err; 
    response['passing'] = sqlRes[0]; 
    response['rushing'] = sqlRes[1]; 
    response['receiving'] = sqlRes[2];
    response['tackle'] = sqlRes[3];
    response['int'] = sqlRes[4];
    response['forcedfum'] = sqlRes[5];
    response['fieldgoal'] = sqlRes[6];
    res.send(response);
})
con.end();

}

exports.coaches = coaches;
exports.teamCoach = teamCoach;
exports.gameStats = gameStats;
exports.leagueSchedule = leagueSchedule;
exports.allPlayers = allPlayers;
exports.teamByTeamName = teamByTeamName; 
exports.teamRoster = teamRoster; 
exports.seasonStats = seasonStats;
exports.playerInfo = playerInfo;
exports.powerRank = powerRank;
exports.playerSearch = playerSearch; 
exports.standings = standings;
exports.conferenceStandings = conferenceStandings;
exports.divisionStandings = divisionStandings;
exports.leagueLeaders = leagueLeaders;
