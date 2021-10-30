const express = require('express'); 
const mysql = require('mysql');
const app = express(); 
const SQL = require('sql-template-strings');
const cors = require('cors');
let teamInfoKeys = []; 
let teamStandingsKeys = [];
let teamsWithInfo = []; 
app.set('port', (process.env.PORT || 3001)); 
app.use(cors());
app.get('/', (req, res) => { 
    res.send('Testing'); 
});

app.get('/test', (req, res)=> { 
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    con.query("select * from teams where teamId = 2", (err, resp) => {
        console.log(resp); 
        res.send(resp);
    })
    con.end();
})

app.get('/api/team/:teamName', (req, res) => {
    const {params: {teamName},} = req; 
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    let sql = SQL`select * from teams where teamName = ${teamName}`;
    let response = {}; 
    con.query(sql, (err, sqlRes) => {
        if (err) res.send(404); 
        res.send(sqlRes); 
    })
    con.end();  
})

app.get('/api/roster/:teamId', (req, res) => { 
    const {params: {teamId},} = req;
    let sql = SQL`select * from players where teamId = ${teamId}`;
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    con.query(sql, (err, sqlRes) => { 
        if (err) res.send(404); 
        res.send(sqlRes); 
    })
    con.end();
})

function calculatePasserRating (stats) { 
    let a = (stats.passCompPct - 30) * .05; 
    let b = (stats.passYdsPerAtt - 3) * .25; 
    let c = (stats.passTDs / stats.passAttempts) * 100 * .2;
    if (c > 2.375) c = 2.375;  
    let d = 2.375 - (stats.ints / stats.passAttempts * 100) * .25;
    return (a + b + c + d) / 6 * 100;  
}
/*
app.get('/api/seasonstats/:year/:position/:playerId', (req, res) => { 
    const {params: {year, position, playerId}, } = req; 
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    let sql;
    if (position === 'qb' || position === 'QB') { 
        sql = SQL`select r.rushAtt, r.rushBrokenTackles, r.rushFum, r.rushLongest, r.rushPts, r.rushTDs, r.rushToPct, r.rush20PlusYds, r.rushYds, r.rushYdsPerAtt, r.rushYdsPerGame,p.passAtt, p.passComp,
         p.passCompPct, p.passInts, p.passLongest, p.passPts, p.passerRating, p.passSacks, p.passTDs, p.passYds, p.passYdsPerGame, p.fullName
        from passing_stats p left join rushing_stats r ON p.rosterId = r.rosterId and p.weekIndex = r.weekIndex where p.rosterId = ${playerId} and p.seasonIndex = ${year};`;
        let response = {
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
        con.query(sql, (err, sqlRes) => { 
            if (err) res.send(500);

            for (const week of sqlRes) { 
                response.name = week.fullName;
                response.rushAttempts += week.rushAtt; 
                response.rushBTackles += week.rushBrokenTackles; 
                response.fumbles += week.rushFum;
                if (week.rushLongest > response.rushLongest) response.rushLongest = week.rushLongest; 
                response.rushPts += week.rushPts; 
                response.rushTDs += week.rushTDs; 
                response.rushYdsPerGame = week.rushYdsPerGame; 
                response.passAttempts += week.passAtt; 
                response.passCompletions += week.passComp; 
                response.ints += week.passInts; 
                if (week.passLongest > response.passLongest) response.passLongest = week.passLongest; 
                response.passPts += week.passPts; 
                response.passSacks += week.passSacks;
                response.passTDs += week.passTDs; 
                response.passYds += week.passYds; 
                response.passYdsPerGame = week.passYdsPerGame;
            }
            response.rushYdsPerAtt = response.rushYds / response.rushAttempts; 
            response.passCompPct = response.passCompletions / response.passAttempts * 100; 
            response.passYdsPerAtt = response.passYds / response.passAttempts;
            response.passerRating = calculatePasserRating(response);
            res.send(response);
        })


    } else if (position === 'HB' || position === 'hb' || position === 'FB' || position === 'fb'){
        sql = SQL`select ru.rushAtt, ru.rushBrokenTackles, ru.rushFum, ru.rushLongest, ru.rushPts, ru.rushTDs, ru.rushToPct, ru.rush20PlusYds, 
        ru.rushYds, ru.rushYdsPerAtt, ru.rushYdsPerGame, re.recCatches, re.recCatchPct, re.recDrops, re.recLongest, re.recPts, re.recTDs, 
        re.recToPct, re.recYds, re.recYdsAfterCatch, re.recYdsPerGame from rushing_stats ru left join receiving_stats re ON ru.rosterId = re.rosterId and ru.weekIndex = re.weekIndex where ru.rosterId = ${playerId} and re.seasonIndex = ${year}`; 

        con.query(sql, (err, sqlRes)=> { 
            if (err || sqlRes === []) res.send(500) 
            let response = { 
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
            
            for (const week of sqlRes){ 
                response.name = week.name;
                response.rushAttempts += week.rushAtt; 
                response.rushBrokenTackles += week.rushBrokenTackles; 
                response.fumbles += week.rushFum; 
                if (response.rushLongest < week.rushLongest) response.rushLongest = week.rushLongest; 
                response.rushPts += week.rushPts
                response.rushTDs += week.rushTDs; 
                response.rush20PlusYds += week.rush20PlusYds; 
                response.rushYds += week.rushYds; 
                response.rushYdsPerGame = week.rushYdsPerGame; 
                response.recCatches += week.recCatches; 
                response.recDrops += week.recDrops; 
                if (response.recLongest < week.recLongest) response.recLongest = week.recLongest; 
                response.recPts += week.recPts; 
                response.recTDs += week.recTDs; 
                response.recYds += week.recYds;
                response.recYdsAfterCatch += week.recYdsAfterCatch; 
                response.recYdsPerGame = week.recYdsPerGame;
            }
            response.rushToPct = response.fumbles / response.rushAttempts;
            response.rushYdsPerAtt = response.rushYds / response.rushAttempts; 
            if (response.recCatches > 0){ 
                response.recYdsPerCatch = response.recYds / response.recCatches;
            }
            res.send(response);

        })
        con.end();
    } else if (position === 'WR' || position === 'wr' || position === 'TE' || position === 'te'){ 
       let response = { 
            "name": '',
            "recCatches": 0,
            "recCatchPct": 0, 
            "recDrops": 0, 
            "recLongest": 0, 
            "recPts": 0, 
            "recTDs": 0, 
            "recToPct": 0, 
            "recYdsAfterCatch": 0, 
            "recYacPerCatch": 0, 
            "recYds": 0, 
            "recYdsPerCatch": 0, 
            "recYdsPerGame": 0
        }
        sql = SQL`select recCatches, recCatchPct, recDrops, recLongest, recPts, recTDs, recToPct, recYdsAfterCatch, recYacPerCatch, recYds, recYdsPerCatch, recYdsPerGame, fullName from receiving_stats where rosterId = ${playerId} and seasonIndex = ${year}`;
        con.query(sql, (err, sqlRes) => { {
            if (err) res.send(500); 
            else{ 
                for (const week of sqlRes) {  
                    response.recCatches += week.recCatches; 
                    response.recDrops += week.recDrops; 
                    if (week.recLongest > response.recLongest) response.recLongest = week.recLongest; 
                    response.recPts += week.recPts;
                    response.recTDs += week.recTDs; 
                    response.
                }
            }
        }})
    } else if (position === 'DT' || position === 'dt' || position === 'DE' || position === 'de' || position === 'LOLB' || position === 'lolb' || position === 'ROLB' || position === 'rolb' || position === 'MLB' || position === 'mlb' || position === 'FS'|| position === 'fs' || position === 'SS' || position === 'ss' || position === 'CB' || position === 'cb' || position === 'def'){
        sql = SQL`select defCatchAllowed, defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs, defTotalTackles from defensive_stats where seasonIndex = ${year} and rosterId = ${playerId}`; 
    } else if (position === 'P' || position === 'p'){ 
        sql = SQL`select p.puntsBlocked, p.puntsIn20, p.puntLongest, p.puntTBs, p.puntNetYdsPerAtt, p.puntNetYds, p.puntAtt, p.puntYdsPerAtt, p.puntYds k.kickoffAtt, k.kickoffTBs from punting_stats left join kicking_stats k ON p.rosterId = k.rosterId where seasonIndex = ${year} and rosterId = ${playerId}`; 
    } else if (position === 'K' || position === 'k') { 
        sql = SQL`select kickPts, fGAtt, fG50PlusAtt, fG50PlusMade, fGLongest, fGMade, fgCompPct, kickoffAtt, kickoffTBs, xPAtt, xPMade, xPCompPct from kicking_stats where seasonIndex = ${year} and rosterId = ${playerId}`;
    } else { 
        res.send(500); 
    }
    con.end();
})
*/
app.get('/api/player/:rosterId', (req, res) => { 
    const {params: {rosterId}, } = req; 
    let sql = SQL`SELECT p.*, t.primaryColor, t.secondaryColor from players p, teams t where p.teamId = t.teamId and p.rosterId = ${rosterId};`; 
    let con = mysql.createConnection({ 
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    con.query(sql, (err, sqlRes) => { 
        if (err) res.send(404); 
        res.send(sqlRes); 
    })
    con.end(); 
})

app.get('/api/powerranking/', (req, res) => { 
    let sql = "select cityName, teamName, totalWins, totalLosses, totalTies, primaryColor, secondaryColor from teams where teamId <> 1 order by teamRank ASC;"
    let con = mysql.createConnection({ 
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    con.query(sql, (err, sqlRes) => { 
        if (err) res.send(404); 
        res.send(sqlRes); 
    })
    con.end();
})

app.post('/:platform/:leagueId/leagueTeams', (req, res) => { 
    let body = ''; 
    req.on('data', chunk=>{ 
        body += chunk.toString();
    })
    req.on('end', () =>{ 
        const teams = JSON.parse(body)['leagueTeamInfoList'];
        console.log('----Teams----');
        for (const team of teams) { 
            teamsWithInfo.push(team); 
        }
        res.sendStatus(200);
    })
})



app.post('/:platform/:leagueId/standings', (req, res) => { 
    let body = ''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 
    req.on('end', () => { 
        console.log('----Standings----');
        const teams = JSON.parse(body)['teamStandingInfoList'];
        Object.keys(teams[0]).forEach(key => { 
            teamStandingsKeys.push(key);
        })
        for (let i = 0; i < teamsWithInfo.length; i++){ 
            teams[i] = {...teams[i], ...teamsWithInfo[i]};  
        }
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
        });
        for (const team of teams) {
                let sql = SQL`INSERT INTO teams (awayLosses, awayTies, calendarYear, conferenceId, confLosses, conferenceName, confTies, confWins, 
                    capRoom, capAvailable, capSpent, defPassYds, defPassYdsRank, defRushYds, defRushYdsRank, defTotalYds, defTotalYdsRank, divisionId,
                    divLosses, divisionName, divTies, divWins, homeLosses, homeTies, homeWins, netPts, offPassYds, offPassYdsRank, offRushYds, offRushYdsRank, 
                    offTotalYds, offTotalYdsRank, ptsAgainstRank, ptsForRank, playoffStatus, prevRank, ptsAgainst, ptsFor, teamRank, seed, seasonIndex, stageIndex, totalLosses, totalTies, 
                    totalWins, teamId, teamName, teamOvr, tODiff, weekIndex, winLossStreak, winPct, abbrName, cityName, defScheme, injuryCount, logoId, nickName, offScheme, 
                    ovrRating, primaryColor, secondaryColor, userName) VALUES (${team.awayLosses}, ${team.awayTies}, ${team.calendarYear}, ${team.conferenceId}, ${team.confLosses}, ${team.conferenceName},
                    ${team.confTies}, ${team.confWins}, ${team.capRoom}, ${team.capAvailable}, ${team.capSpent}, ${team.defPassYds}, ${team.defPassYdsRank},${team.defRushYds}, ${team.defRushYdsRank}, 
                    ${team.defTotalYds}, ${team.defTotalYdsRank}, ${team.divisionId}, ${team.divLosses}, ${team.divisionName}, ${team.divTies}, ${team.divWins}, ${team.homeLosses}, ${team.homeTies}, 
                    ${team.homeWins}, ${team.netPts}, ${team.offPassYds}, ${team.offPassYdsRank}, ${team.offRushYds}, ${team.offRushYdsRank}, ${team.offTotalYds}, ${team.offTotalYdsRank}, ${team.ptsAgainstRank}, 
                    ${team.ptsForRank}, ${team.playoffStatus}, ${team.prevRank},${team.ptsFor}, ${team.ptsAgainst}, ${team.rank}, ${team.seed}, ${team.seasonIndex}, ${team.stageIndex}, ${team.totalLosses},${team.totalTies}, ${team.totalWins}, 
                    ${team.teamId}, ${team.teamName}, ${team.teamOvr}, ${team.tODiff}, ${team.weekIndex}, ${team.winLossStreak},${team.winPct}, ${team.abbrName}, ${team.cityName}, ${team.defScheme}, 
                    ${team.injuryCount}, ${team.logoId}, ${team.nickName}, ${team.offScheme}, ${team.ovrRating}, ${team.primaryColor}, ${team.secondaryColor}, ${team.userName}) 
                    ON DUPLICATE KEY UPDATE awayLosses=VALUES(awayLosses), awayTies=VALUES(awayTies), calendarYear=VALUES(calendarYear), confLosses=VALUES(confLosses), confTies=VALUES(confTies), confWins=VALUES(confWins),
                    capRoom=VALUES(capRoom), capAvailable=VALUES(capAvailable), capSpent=VALUES(capSpent), defPassYds=VALUES(defPassYds), defPassYdsRank=VALUES(defPassYdsRank), defRushYds=VALUES(defRushYds), defRushYdsRank=VALUES(defRushYdsRank),
                    defTotalYds=VALUES(defTotalYds), defTotalYdsRank=VALUES(defTotalYdsRank), divLosses=VALUES(divLosses), divTies=VALUES(divTies), divWins=VALUES(divWins), homeLosses=VALUES(homeLosses), homeTies=VALUES(homeTies), homeWins=VALUES(homeWins),
                    netPts=VALUES(netPts), offPassYds=VALUES(offPassYds), offPassYdsRank=VALUES(offPassYdsRank), offRushYds=VALUES(offRushYds), offRushYdsRank=VALUES(offRushYdsRank), offTotalYds=VALUES(offTotalYds), offTotalYdsRank=VALUES(offTotalYdsRank),
                    ptsAgainstRank=VALUES(ptsAgainstRank), ptsForRank=VALUES(ptsForRank), playoffStatus=VALUES(playoffStatus), prevRank=VALUES(prevRank),ptsFor=VALUES(ptsFor), ptsAgainst=VALUES(ptsAgainst), teamRank=VALUES(teamRank), seed=VALUES(seed), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex),
                    totalLosses=VALUES(totalLosses), totalTies=VALUES(totalTies), totalWins=VALUES(totalWins), teamOvr=VALUES(teamOvr), tODiff=VALUES(tODiff), weekIndex=VALUES(weekIndex), winLossStreak=VALUES(winLossStreak), winPct=VALUES(winPct),
                    defScheme=VALUES(defScheme), injuryCount=VALUES(injuryCount), offScheme=VALUES(offScheme), ovrRating=VALUES(ovrRating), userName=VALUES(userName)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })

        }
        con.end();
        teamsWithInfo = []; 
        res.sendStatus(200); 
    });
})

let counter = 0; 
app.post('/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => { 
    let body = ''; 

    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 

    req.on('end', () => {
        const {params: {dataType, weekType},} = req; 
        console.log(`----${dataType}----`);
        let json = JSON.parse(body)
        let sql; 
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
            });
        if (dataType === 'teamstats'){  
            let stats = json['teamStatInfoList'];
            for (const stat of stats) {
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23
                } 
                sql = SQL`INSERT INTO team_stats (defForcedFum, defFumRec, defIntsRec, defPtsPerGame, defPassYds, defRushYds,
                    defRedZoneFGs, defRedZones, defRedZonePct, defRedZoneTDs, defSacks, defTotalYds, off4thDownAtt, off4thDownConv,
                    off4thDownConvPct, offFumLost, offIntsLost, off1stDowns, offPtsPerGame, offPassTDs, offPassYds, offRushTDs, offRushYds,
                    offRedZoneFGs, offRedZones, offRedZonePct, offRedZoneTDs, offSacks, off3rdDownAtt, off3rdDownConv, off3rdDownConvPct,
                    off2PtAtt, off2PtConv, off2PtConvPct, offTotalYds, offTotalYdsGained, penalties, penaltyYds, scheduleId, seed, seasonIndex,
                    statId, stageIndex, totalLosses, teamId, tODiff, tOGiveaways, tOTakeaways, totalTies, totalWins, weekIndex)
                    VALUES (${stat.defForcedFum}, ${stat.defFumRec}, ${stat.defIntsRec}, ${stat.defPtsPerGame}, ${stat.defPassYds}, ${stat.defRushYds},
                    ${stat.defRedZoneFGs}, ${stat.defRedZones}, ${stat.defRedZonePct}, ${stat.defRedZoneTDs}, ${stat.defSacks}, ${stat.defTotalYds},
                    ${stat.off4thDownAtt}, ${stat.off4thDownConv}, ${stat.off4thDownConvPct}, ${stat.offFumLost}, ${stat.offIntsLost}, ${stat.off1stDowns},
                    ${stat.offPtsPergame}, ${stat.offPassTds}, ${stat.offPassYds}, ${stat.offRushTDs}, ${stat.offRushYds}, ${stat.offRedZoneFGs}, ${stat.ofFRedZones},
                    ${stat.offRedZonePct}, ${stat.offRedZoneTDs}, ${stat.offSacks}, ${stat.off3rdDownAtt}, ${stat.off3rdDownConv}, ${stat.off3rdDownConvPct}, ${stat.off2PtAtt},
                    ${stat.off2PtConv}, ${stat.off2PtConvPct}, ${stat.offTotalYds}, ${stat.offTotalYdsGained}, ${stat.penalties}, ${stat.penaltyYds}, ${stat.scheduleId},
                    ${stat.seed}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.totalLosses}, ${stat.teamId}, ${stat.tODiff}, ${stat.tOGiveaways}, ${stat.tOTakeaways},
                    ${stat.totalTies}, ${stat.totalWins}, ${stat.weekIndex}) ON DUPLICATE KEY UPDATE defForcedFum=VALUES(defForcedFum), defFumRec=VALUES(defFumRec), defIntsRec=VALUES(defIntsRec), 
                    defPtsPerGame=VALUES(defPtsPerGame), defPassYds=VALUES(defPassYds), defRushYds=VALUES(defRushYds), defRedZoneFGs=VALUES(defRedZoneFGs), defRedZones=VALUES(defRedZones), defRedZonePct=VALUES(defRedZonePct),
                    defRedZoneTDs=VALUES(defRedZoneTDs), defSacks=VALUES(defSacks), defTotalYds=VALUES(defTotalYds), off4thDownAtt=VALUES(off4thDownAtt), off4thDownConv=VALUeS(off4thDownConv), off4thDownConvPct=VALUES(off4thDownConvPct), 
                    offFumLost=VALUES(offFumLost), offIntsLost=VALUES(ofFIntsLost), off1stDowns=VALUES(off1stDowns), offPtsPerGame=VALUES(offPtsPerGame), offPassTDs=VALUES(offPassTDs), offPassYds=VALUES(offPassYds), offRushTDs=VALUES(ofFRushTDs),
                    offRushYds=VALUES(offRushYds), offRedZoneFGs=VALUES(offRedZoneFGs), offRedZones=VALUES(ofFRedZones), offRedZonePct=VALUES(offRedZonePct), offRedZoneTDs=VALUES(offRedZoneTDs), offSacks=VALUES(offSacks), 
                    off3rdDownAtt=VALUES(off3rdDownAtt), off3rdDownConv=VALUES(off3rdDownConv), off3rdDownConvPct=VALUES(off3rdDownConvPct), off2PtAtt=VALUES(off2PtAtt), off2PtConv=VALUES(off2PtConv), off2PtConvPct=VALUES(off2PtConvPct),
                    offTotalYds=VALUES(offTotalYds), offTotalYdsGained=VALUES(offTotalYdsGained), penalties=VALUES(penalties), penaltyYds=VALUES(penaltyYds), scheduleId=VALUES(scheduleId), totalLosses=VALUES(totalLosses), tODiff=VALUES(tODiff),
                    tOGiveaways=VALUES(tOGiveaways), tOTakeaways=VALUES(tOTakeaways), totalTies=VALUES(totalTies), totalWins=VALUES(totalWins), weekIndex=VALUES(weekIndex)`; 
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
            }

        }else if (dataType === 'schedules'){ 
            let stats= json['gameScheduleInfoList']; 
            for (let stat of stats) {
                stat.weekIndex++; 
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23; 
                }
                sql = SQL`INSERT INTO schedules (awayScore, awayTeamId, isGameOfTheWeek, homeScore, homeTeamId, scheduleId, seasonIndex, stageIndex, weekStatus, weekIndex) VALUES 
                (${stat.awayScore}, ${stat.awayTeamId}, ${stat.isGameOfTheWeek}, ${stat.homeScore}, ${stat.homeTeamId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.stageIndex}, ${stat.status}, ${stat.weekIndex}) 
                ON DUPLICATE KEY UPDATE awayScore=VALUES(awayScore), awayTeamId=VALUES(awayTeamId), isGameOfTheWeek=VALUES(isGameOfTheWeek), homeScore=VALUES(homeScore), homeTeamId=VALUES(homeTeamId), seasonIndex=VALUES(seasonIndex), weekStatus=VALUES(weekStatus), weekIndex=VALUES(weekIndex)`;                
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
            }
        }else if (dataType === 'punting'){ 
            let stats = json['playerPuntingStatInfoList'];
            for (let stat of stats) { 
                stat.weekIndex++; 
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23; 
                }
                sql = SQL`INSERT INTO punting_stats (fullName, puntsBlocked, puntsIn20, puntLongest, puntTBs, puntNetYdsPerAtt, puntNetYds, puntAtt, rosterId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES
                (${stat.fullName}, ${stat.puntsBlocked}, ${stat.puntsIn20}, ${stat.puntLongest}, ${stat.puntTBs}, ${stat.puntNetYdsPerAtt}, ${stat.puntNetYds}, ${stat.puntAtt}, ${stat.rosterId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
                ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), puntsBlocked=VALUES(puntsBlocked), puntsIn20=VALUES(puntsIn20), puntLongest=VALUES(puntLongest), puntTBs=VALUES(puntTBs), puntNetYdsPerAtt=VALUES(puntNetYdsPerAtt), puntNetYds=VALUES(puntNetYds), rosterId=VALUES(rosterId), scheduleId=VALUES(scheduleId), seasonIndex=VALUES(seasonIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
            } 
        }else if (dataType === 'passing'){ 
            let stats = json['playerPassingStatInfoList'];
            for (let stat of stats) {
                stat.weekIndex++; 
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23; 
                }
                sql = SQL`INSERT INTO passing_stats (fullName, passAtt, passComp, passCompPct, passInts, passLongest, passPts, passerRating, passSacks, passTDs, passYds, passYdsPerAtt, passYdsPerGame, rosterid, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
                (${stat.fullName}, ${stat.passAtt}, ${stat.passComp}, ${stat.passCompPct}, ${stat.passInts}, ${stat.passLongest}, ${stat.passPts}, ${stat.passerRating}, ${stat.passSacks}, ${stat.passTDs}, ${stat.passYds}, ${stat.passYdsPerAtt}, ${stat.passYdsPerGame}, ${stat.rosterId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
                ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), passAtt=VALUES(passAtt), passComp=VALUES(passComp), passInts=VALUES(passInts), passLongest=VALUES(passLongest), passPts=VALUES(passPts), passerRating=VALUES(passerRating), passSacks=VALUES(passSacks), passTDs=VALUES(passTDs), passYds=VALUES(passYds), passYdsPerAtt=VALUES(passYdsPerAtt), passYdsPerGame=VALUES(passYdsPerGame), rosterId=VALUES(rosterId), scheduleId=VALUES(scheduleId),
                seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
            }
        }else if (dataType === 'defense'){ 
            let stats = json['playerDefensiveStatInfoList']; 
            for (let stat of stats) {
                stat.weekIndex++; 
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23; 
                }
                sql = SQL`INSERT INTO defensive_stats (defCatchAllowed, defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs, defTotalTackles, fullName, rosterId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
                (${stat.defCatchAllowed}, ${stat.defDeflections}, ${stat.defForcedFum}, ${stat.defFumRec}, ${stat.defInts}, ${stat.defIntReturnYds}, ${stat.defPts}, ${stat.defSacks}, ${stat.defSafeties}, ${stat.defTDs}, ${stat.defTotalTackles}, ${stat.fullName}, ${stat.rosterId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
                ON DUPLICATE KEY UPDATE defCatchAllowed=VALUES(defCatchAllowed), defDeflections=VALUES(defDeflections), defForcedFum=VALUES(defForcedFum), defFumRec=VALUES(defFumRec), defInts=VALUES(defInts), defIntReturnYds=VALUES(defIntReturnYds),
                defPts=VALUES(defPts), defSacks=VALUES(defSacks), defSafeties=VALUES(defSafeties), defTDs=VALUES(defTDs), defTotalTackles=VALUES(defTotalTackles), scheduleId=VALUES(scheduleId), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
                con.query(sql, (err, res) => {
                    if (err) throw err;
                })
            }
        }else if (dataType === 'kicking'){ 
            let stats = json['playerKickingStatInfoList'];
            for (let stat of stats) { 
                stat.weekIndex++; 
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23; 
                }
                sql = SQL`INSERT INTO kicking_stats (kickPts, fGAtt, fG50PlusAtt, fG50PlusMade, fGLongest, fGMade, fGCompPct, fullName, kickoffAtt, kickoffTBs, rosterId, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex, xPAtt, xPMade, xPCompPct)
                VALUES (${stat.kickPts}, ${stat.fGAtt}, ${stat.fG50PlusAtt}, ${stat.fG50PlusMade}, ${stat.fGLongest}, ${stat.fGMade}, ${stat.fGCompPct}, ${stat.fullName}, ${stat.kickoffAtt}, ${stat.kickoffTBs}, ${stat.rosterId}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex}, ${stat.xPAtt}, ${stat.xPMade}, ${stat.xPCompPct})
                ON DUPLICATE KEY UPDATE kickPts=VALUES(kickPts), fGAtt=VALUES(fGAtt), fG50PlusAtt=VALUES(fG50PlusAtt), fG50PlusMade=VALUES(fG50PlusMade), fGLongest=VALUES(fGLongest), fGMade=VALUES(fGMade), fGCompPct=VALUES(fGCompPct), kickoffAtt=VALUES(kickoffAtt), kickoffTBs=VALUES(kickoffTBs), rosterId=VALUES(rosterId), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), weekIndex=VALUES(weekIndex), xPAtt=VALUES(xPAtt), xPMade=VALUES(xPMade), xPCompPct=VALUES(xPCompPct)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
            } 
        }else if (dataType === 'rushing') {
            let stats = json['playerRushingStatInfoList']; 
            for (let stat of stats) { 
                stat.weekIndex++; 
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23; 
                }
                sql = SQL`INSERT INTO rushing_stats (fullName, rushAtt, rushBrokenTackles, rushFum, rushLongest, rushPts, rosterId, rushTDs, rushToPct, rush20PlusYds, rushYdsAfterContact, rushYds, rushYdsPerAtt, rushYdsPerGame, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
                (${stat.fullName}, ${stat.rushAtt}, ${stat.rushBrokenTackles}, ${stat.rushFum}, ${stat.rushLongest}, ${stat.rushPts}, ${stat.rosterId}, ${stat.rushTDs}, ${stat.rushToPct}, ${stat.rush20PlusYds}, ${stat.rushYdsAfterContact}, ${stat.rushYds}, ${stat.rushYdsPerAtt}, ${stat.rushYdsPerGame}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
                ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), rushAtt=VALUES(rushAtt), rushBrokenTackles=VALUES(rushBrokenTackles), rushFum=VALUES(rushFum), rushLongest=VALUES(rushLongest), rushPts=VALUES(rushPts), rosterId=VALUES(rosterId), rushTDs=VALUES(rushTDs), rushToPct=VALUES(rushToPct), rush20PlusYds=VALUES(rush20PlusYds), rushYdsAfterContact=VALUES(rushYdsAfterContact), rushYds=VALUES(rushYds), rushYdsPerAtt=VALUES(rushYdsPerAtt), rushYdsPerGame=VALUES(rushYdsPerGame), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex)`;
                con.query(sql, (err, res) => {
                    if (err) throw err;
                })
            }
        }else if (dataType === 'receiving') { 
            Object.keys(json).forEach(key => { 
                console.log(`Receivng stats keys ${key}`)
            })
            let stats = json['playerReceivingStatInfoList'];
            for (let stat of stats) {
                console.log(stat);  
                stat.weekIndex++; 
                if (req.params.weekType === 'pre'){ 
                    stat.weekIndex += 23; 
                }
                sql = SQL`INSERT INTO receiving_stats (fullName, recCatches, recCatchPct, recDrops, recLongest, recPts, rosterId, recTDs, recToPct, recYdsAfterCatch, recYacPerCatch, recYds, recYdsPerCatch, recYdsPerGame, scheduleId, seasonIndex, statId, stageIndex, teamId, weekIndex) VALUES 
                (${stat.fullName}, ${stat.recCatches}, ${stat.recCatchPct}, ${stat.recDrops}, ${stat.recLongest}, ${stat.recPts}, ${stat.rosterId}, ${stat.recTDs}, ${stat.recToPct}, ${stat.recYdsAfterCatch}, ${stat.recYacPerCatch}, ${stat.recYds}, ${stat.recYdsPerCatch}, ${stat.recYdsPerGame}, ${stat.scheduleId}, ${stat.seasonIndex}, ${stat.statId}, ${stat.stageIndex}, ${stat.teamId}, ${stat.weekIndex})
                ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), recCatches=VALUES(recCatches), recCatchPct=VALUES(recCatchPct), recDrops=VALUES(recDrops), recLongest=VALUES(recLongest), recPts=VALUES(recPts), rosterId=VALUES(rosterId), recTDs=VALUES(recTDs), recToPct=VALUES(recToPct), recYdsAfterCatch=VALUES(recYdsAfterCatch), recYacPerCatch=VALUES(recYacPerCatch),
                recYds=VALUES(recYds), recYdsPerCatch=VALUES(recYdsPerCatch), recYdsPerGame=VALUES(recYdsPerGame), seasonIndex=VALUES(seasonIndex), stageIndex=VALUES(stageIndex), teamId=VALUES(teamId), weekIndex=VALUES(weekIndex)`;
                con.query(sql, (err, res) => {
                    if (err) throw err;
                })
            }
        }
        con.end();
        res.sendStatus(200);
    });
});

app.post('/:platform/:leagueId/freeagents/roster', (req, res) => { 
    let body =''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    });
    req.on('end', () => { 
        //console.log('----Free Agents----'); 
        const json = JSON.parse(body)['rosterInfoList']; 
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
            });
        for (player of json) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            // 118 values
            let sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryLength, injuryType,
                intangibleGrade, isActive, isFreeAgent, isOnIr, isOnPracticeSquad, jerseyNum, jukeMoveRating, jumpRating, kickAccRating, kickPowerRating, kickRetRating,
                lBStyleTrait, lastName, leadBlockRating, legacyScore, manCoverRating, passBlockFinesseRating, passBlockPowerRating, passBlockRating, penaltyTrait, physicalGrade,
                playActionRating, playBallTrait, playRecRating, playerBestOvr, playerSchemeOvr, portraitId, posCatchTrait, position, powerMovesRating, predictTrait, presentationId, pressRating, productionGrade, 
                pursuitRating, qBStyleTrait, reSignStatus, releaseRating, rookieYear, rosterId, routeRunDeepRating, routeRunMedRating, routeRunShortRating, runBlockFinesseRating, runBlockPowerRating, 
                runBlockRating, runStyle, scheme, sensePressureTrait, sizeGrade, skillPoints, specCatchRating, speedRating, spinMoveRating, staminaRating, stiffArmRating, strengthRating, stripBallTrait, 
                tackleRating, teamId, teamSchemeOvr, throwAccDeepRating, throwAccMedRating, throwAccRating, throwAccShortRating, throwAwayTrait, throwOnRunRating, throwPowerRating, throwUnderPressureRating, 
                tightSpiralTrait, toughRating, truckRating, weight, yACCatchTrait, yearsPro, zoneCoverRating) VALUES (${player.accelRating}, ${player.age}, ${player.agilityRating}, ${player.awareRating}, ${player.bCVRating},
                ${player.bigHitTrait}, ${player.birthDay}, ${player.birthMonth}, ${player.birthYear}, ${player.blockShedRating}, ${player.breakSackRating}, ${player.breakTackleRating}, ${player.cITRating}, ${player.capHit},
                ${player.capReleaseNetSavings}, ${player.capReleasePenalty}, ${player.carryRating}, ${player.catchRating}, ${player.changeOfDirectionRating}, ${player.clutchTrait}, ${player.college}, ${player.confRating},
                ${player.contractBonus}, ${player.contractLength}, ${player.contractSalary}, ${player.contractYearsLeft}, ${player.coverBallTrait}, ${player.dLBullRushTrait}, ${player.dLSpinTrait}, ${player.dLSwimTrait},
                ${player.desiredBonus}, ${player.desiredLength}, ${player.desiredSalary}, ${player.devTrait}, ${player.draftPick}, ${player.draftRound}, ${player.dropOpenPassTrait}, ${player.durabilityGrade}, ${player.experiencePoints},${player.feetInBoundsTrait},
                ${player.fightForYardsTrait}, ${player.finesseMovesRating}, ${player.firstName}, ${player.forcePassTrait}, ${player.hPCatchTrait}, ${player.height}, ${player.highMotorTrait}, ${player.hitPowerRating}, ${player.homeState},
                ${player.homeTown}, ${player.impactBlockRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIr}, ${player.IsOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
                ${player.kickAccRating}, ${player.kickPowerRating}, ${player.kickRetRating}, ${player.lBStyleTrait}, ${player.lastName}, ${player.leadBlockRating}, ${player.legacyScore}, ${player.manCoverRating}, ${player.passBlockFinesseRating},
                ${player.passBlockPowerRating}, ${player.passBlockRating}, ${player.penaltyTrait}, ${player.physicalGrade}, ${player.playActionRating}, ${player.playBallTrait}, ${player.playRecRating}, ${player.playerBestOvr}, ${player.playerSchemeOvr},
                ${player.portraitId}, ${player.posCatchTrait}, ${player.position}, ${player.powerMovesRating}, ${player.predictTrait}, ${player.presentationId}, ${player.pressRating}, ${player.productionGrade}, ${player.pursuitRating}, 
                ${player.qBStyleTrait}, ${player.reSignStatus}, ${player.releaseRating}, ${player.rookieYear}, ${player.rosterId}, ${player.routeRunDeepRating}, ${player.routeRunMedRating}, ${player.routeRunShortRating}, ${player.runBlockFinesseRating}, ${player.runBlockPowerRating}, ${player.runBlockRating},
                ${player.runStyle}, ${player.scheme}, ${player.sensePressureTrait}, ${player.sizeGrade}, ${player.skillPoints}, ${player.specCatchRating}, ${player.speedRating}, ${player.spinMoveRating}, ${player.staminaRating}, ${player.stiffArmRating},
                ${player.strengthRating}, ${player.stripBallTrait}, ${player.tackleRating}, ${player.teamId}, ${player.teamSchemeOvr}, ${player.throwAccDeepRating}, ${player.throwAccMidRating}, ${player.throwAccRating}, ${player.throwAccShortRating},
                ${player.throwAwayTrait}, ${player.throwOnRunRating}, ${player.throwPowerRating}, ${player.throwUnderPressureRating}, ${player.tightSpiralTrait}, ${player.toughRating}, ${player.truckRating}, ${player.weight}, ${player.yACCatchTrait}, ${player.yearsPro}, ${player.zoneCoverRating})
                ON DUPLICATE KEY UPDATE accelRating=VALUES(accelRating), age=VALUES(age), agilityRating=VALUES(agilityRating), awareRating=VALUES(awareRating), bCVRating=VALUES(bCVRating), blockShedrating=VALUES(blockShedRating), breakSackRating=VALUES(breakSackRating), 
                breakTackleRating=VALUES(breakTackleRating), cITRating=VALUES(cITRating), capHit=VALUES(capHit), capReleaseNetSavings=VALUES(capReleaseNetSavings), carryRating=VALUES(carryRating), catchRating=VALUES(catchRating), changeOfDirectionRating=VALUES(changeOfDirectionRating), confRating=VALUES(confRating), 
                contractBonus=VALUES(contractBonus), contractLength=VALUES(contractLength), contractSalary=VALUES(contractSalary), contractYearsLeft=VALUES(contractYearsLeft), desiredBonus=VALUES(desiredBonus), desiredLength=VALUES(desiredLength),
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr),
                    playerSchemeOvr=VALUES(playerSchemeOvr), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), pursuitRating=VALUES(pursuitRating), 
                    reSignStatus=VALUES(reSignStatus), releaseRating=VALUES(releaseRating), routeRunDeepRating=VALUES(routeRunDeepRating), routeRunMedRating=VALUES(routeRunMedRating), routeRunShortRating=VALUES(routeRunShortRating), 
                    runBlockFinesseRating=VALUES(runBlockFinesseRating), runBlockPowerRating=VALUES(runBlockPowerRating), runBlockRating=VALUES(runBlockRating), runStyle=VALUES(runStyle), scheme=VALUES(scheme), sizeGrade=VALUES(sizeGrade), 
                    skillPoints=VALUES(skillPoints), specCatchRating=VALUES(specCatchRating), speedRating=VALUES(speedRating), spinMoveRating=VALUES(spinMoveRating), staminaRating=VALUES(staminaRating), stiffArmRating=VALUES(stiffArmRating),
                    strengthRating=VALUES(strengthRating), tackleRating=VALUES(tackleRating), teamId=VALUES(teamId), teamSchemeOvr=VALUES(teamSchemeOvr), throwAccDeepRating=VALUES(throwAccDeepRating), throwAccMedRating=VALUES(throwAccMedRating),
                    throwAccRating=VALUES(throwAccRating), throwAccShortRating=VALUES(throwAccShortRating), throwOnRunRating=VALUES(throwOnRunRating), throwPowerRating=VALUES(throwPowerRating), throwUnderPressureRating=VALUES(throwUnderPressureRating), 
                    toughRating=VALUES(toughRating), truckRating=VALUES(truckRating), weight=VALUES(weight), yACCatchTrait=VALUES(yACCatchTrait), yearsPro=VALUES(yearsPro), zoneCoverRating=VALUES(zoneCoverRating)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
            

                    
        }
        con.end();
        res.sendStatus(200); 
    })
});

app.post('/:platform/:leagueId/team/:teamId/roster', (req, res) => { 
    let body = '';
    req.on('data', chunk => { 
        body += chunk.toString();
    }); 
    req.on('end', () => { 
       // console.log('---Team Rosters----'); 
        const json = JSON.parse(body)['rosterInfoList'];
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
            });
        for (player of json) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            // 118 values
            let sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryLength, injuryType,
                intangibleGrade, isActive, isFreeAgent, isOnIr, isOnPracticeSquad, jerseyNum, jukeMoveRating, jumpRating, kickAccRating, kickPowerRating, kickRetRating,
                lBStyleTrait, lastName, leadBlockRating, legacyScore, manCoverRating, passBlockFinesseRating, passBlockPowerRating, passBlockRating, penaltyTrait, physicalGrade,
                playActionRating, playBallTrait, playRecRating, playerBestOvr, playerSchemeOvr, portraitId, posCatchTrait, position, powerMovesRating, predictTrait, presentationId, pressRating, productionGrade, 
                pursuitRating, qBStyleTrait, reSignStatus, releaseRating, rookieYear, rosterId, routeRunDeepRating, routeRunMedRating, routeRunShortRating, runBlockFinesseRating, runBlockPowerRating, 
                runBlockRating, runStyle, scheme, sensePressureTrait, sizeGrade, skillPoints, specCatchRating, speedRating, spinMoveRating, staminaRating, stiffArmRating, strengthRating, stripBallTrait, 
                tackleRating, teamId, teamSchemeOvr, throwAccDeepRating, throwAccMedRating, throwAccRating, throwAccShortRating, throwAwayTrait, throwOnRunRating, throwPowerRating, throwUnderPressureRating, 
                tightSpiralTrait, toughRating, truckRating, weight, yACCatchTrait, yearsPro, zoneCoverRating) VALUES (${player.accelRating}, ${player.age}, ${player.agilityRating}, ${player.awareRating}, ${player.bCVRating},
                ${player.bigHitTrait}, ${player.birthDay}, ${player.birthMonth}, ${player.birthYear}, ${player.blockShedRating}, ${player.breakSackRating}, ${player.breakTackleRating}, ${player.cITRating}, ${player.capHit},
                ${player.capReleaseNetSavings}, ${player.capReleasePenalty}, ${player.carryRating}, ${player.catchRating}, ${player.changeOfDirectionRating}, ${player.clutchTrait}, ${player.college}, ${player.confRating},
                ${player.contractBonus}, ${player.contractLength}, ${player.contractSalary}, ${player.contractYearsLeft}, ${player.coverBallTrait}, ${player.dLBullRushTrait}, ${player.dLSpinTrait}, ${player.dLSwimTrait},
                ${player.desiredBonus}, ${player.desiredLength}, ${player.desiredSalary}, ${player.devTrait}, ${player.draftPick}, ${player.draftRound}, ${player.dropOpenPassTrait}, ${player.durabilityGrade}, ${player.experiencePoints},${player.feetInBoundsTrait},
                ${player.fightForYardsTrait}, ${player.finesseMovesRating}, ${player.firstName}, ${player.forcePassTrait}, ${player.hPCatchTrait}, ${player.height}, ${player.highMotorTrait}, ${player.hitPowerRating}, ${player.homeState},
                ${player.homeTown}, ${player.impactBlockRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIr}, ${player.IsOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
                ${player.kickAccRating}, ${player.kickPowerRating}, ${player.kickRetRating}, ${player.lBStyleTrait}, ${player.lastName}, ${player.leadBlockRating}, ${player.legacyScore}, ${player.manCoverRating}, ${player.passBlockFinesseRating},
                ${player.passBlockPowerRating}, ${player.passBlockRating}, ${player.penaltyTrait}, ${player.physicalGrade}, ${player.playActionRating}, ${player.playBallTrait}, ${player.playRecRating}, ${player.playerBestOvr}, ${player.playerSchemeOvr},
                ${player.portraitId}, ${player.posCatchTrait}, ${player.position}, ${player.powerMovesRating}, ${player.predictTrait}, ${player.presentationId}, ${player.pressRating}, ${player.productionGrade}, ${player.pursuitRating}, 
                ${player.qBStyleTrait}, ${player.reSignStatus}, ${player.releaseRating}, ${player.rookieYear}, ${player.rosterId}, ${player.routeRunDeepRating}, ${player.routeRunMedRating}, ${player.routeRunShortRating}, ${player.runBlockFinesseRating}, ${player.runBlockPowerRating}, ${player.runBlockRating},
                ${player.runStyle}, ${player.scheme}, ${player.sensePressureTrait}, ${player.sizeGrade}, ${player.skillPoints}, ${player.specCatchRating}, ${player.speedRating}, ${player.spinMoveRating}, ${player.staminaRating}, ${player.stiffArmRating},
                ${player.strengthRating}, ${player.stripBallTrait}, ${player.tackleRating}, ${player.teamId}, ${player.teamSchemeOvr}, ${player.throwAccDeepRating}, ${player.throwAccMidRating}, ${player.throwAccRating}, ${player.throwAccShortRating},
                ${player.throwAwayTrait}, ${player.throwOnRunRating}, ${player.throwPowerRating}, ${player.throwUnderPressureRating}, ${player.tightSpiralTrait}, ${player.toughRating}, ${player.truckRating}, ${player.weight}, ${player.yACCatchTrait}, ${player.yearsPro}, ${player.zoneCoverRating})
                ON DUPLICATE KEY UPDATE accelRating=VALUES(accelRating), age=VALUES(age), agilityRating=VALUES(agilityRating), awareRating=VALUES(awareRating), bCVRating=VALUES(bCVRating), blockShedrating=VALUES(blockShedRating), breakSackRating=VALUES(breakSackRating), 
                breakTackleRating=VALUES(breakTackleRating), cITRating=VALUES(cITRating), capHit=VALUES(capHit), capReleaseNetSavings=VALUES(capReleaseNetSavings), carryRating=VALUES(carryRating), catchRating=VALUES(catchRating), changeOfDirectionRating=VALUES(changeOfDirectionRating), confRating=VALUES(confRating), 
                contractBonus=VALUES(contractBonus), contractLength=VALUES(contractLength), contractSalary=VALUES(contractSalary), contractYearsLeft=VALUES(contractYearsLeft), desiredBonus=VALUES(desiredBonus), desiredLength=VALUES(desiredLength),
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr),
                    playerSchemeOvr=VALUES(playerSchemeOvr), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), pursuitRating=VALUES(pursuitRating), 
                    reSignStatus=VALUES(reSignStatus), releaseRating=VALUES(releaseRating), routeRunDeepRating=VALUES(routeRunDeepRating), routeRunMedRating=VALUES(routeRunMedRating), routeRunShortRating=VALUES(routeRunShortRating), 
                    runBlockFinesseRating=VALUES(runBlockFinesseRating), runBlockPowerRating=VALUES(runBlockPowerRating), runBlockRating=VALUES(runBlockRating), runStyle=VALUES(runStyle), scheme=VALUES(scheme), sizeGrade=VALUES(sizeGrade), 
                    skillPoints=VALUES(skillPoints), specCatchRating=VALUES(specCatchRating), speedRating=VALUES(speedRating), spinMoveRating=VALUES(spinMoveRating), staminaRating=VALUES(staminaRating), stiffArmRating=VALUES(stiffArmRating),
                    strengthRating=VALUES(strengthRating), tackleRating=VALUES(tackleRating), teamId=VALUES(teamId), teamSchemeOvr=VALUES(teamSchemeOvr), throwAccDeepRating=VALUES(throwAccDeepRating), throwAccMedRating=VALUES(throwAccMedRating),
                    throwAccRating=VALUES(throwAccRating), throwAccShortRating=VALUES(throwAccShortRating), throwOnRunRating=VALUES(throwOnRunRating), throwPowerRating=VALUES(throwPowerRating), throwUnderPressureRating=VALUES(throwUnderPressureRating), 
                    toughRating=VALUES(toughRating), truckRating=VALUES(truckRating), weight=VALUES(weight), yACCatchTrait=VALUES(yACCatchTrait), yearsPro=VALUES(yearsPro), zoneCoverRating=VALUES(zoneCoverRating)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
        }
        con.end();
        res.sendStatus(200);
    });
});


app.listen(app.get('port'), ()=>{ 
    console.log('Running on part', app.get('port'));
});
