const express = require('express'); 
const mysql = require('mysql');
const app = express(); 
const SQL = require('sql-template-strings');
const cors = require('cors');
const { Z_FIXED } = require('zlib');
const { resolveSoa } = require('dns');
let teamInfoKeys = []; 
let teamStandingsKeys = [];
let teamsWithInfo = []; 
let players = [];
let playerDate;
let teamIdToName = new Map([ 
    [980680704,'49ers'],
    [980680705,'Bears'],
    [980680706, 'Bengals'],
    [980680707, 'Bills'],
    [980680708, 'Broncos'],
    [980680709, 'Browns'],
    [980680710, 'Buccaneers'],
    [980680711, 'Cardinals'],
    [980680744, 'Chargers'],
    [980680745, 'Chiefs'],
    [980680746, 'Colts'],
    [980680747, 'Cowboys'],
    [980680748, 'Dolphins'],
    [980680749, 'Eagles'],
    [980680750, 'Falcons'],
    [980680751, 'Football Team'], 
    [980680753, 'Giants'],
    [980680755, 'Jaguars'],
    [980680756, 'Jets'],
    [980680757, 'Lions'],
    [980680759, 'Packers'],
    [980680760, 'Panthers'],
    [980680761, 'Patriots'],
    [980680762, 'Raiders'],
    [980680763, 'Rams'],
    [980680764, 'Ravens'],
    [980680765, 'Saints'],
    [980680766, 'Seahawks'],
    [980680767, 'Steelers'],
    [980680768, 'Texans'],
    [980680769, 'Titans'],
    [980680770, 'Vikings'],
    [1, 'FA']
]);

let teamNameToID = new Map([
    ['49ers', 980680704],
    ['Bears', 980680705],
    ['Bengals', 980680706],
    ['Bills',980680707],
    ['Broncos',980680708],
    ['Browns',980680709],
    ['Buccaneers',980680710],
    ['Cardinals',980680711],
    ['Chargers',980680744],
    ['Chiefs',980680745],
    ['Colts',980680746],
    ['Cowboys',980680747],
    ['Dolphins',980680748],
    ['Eagles',980680749],
    ['Falcons',980680750],
    ['Football Team',980680751], 
    ['Giants',980680753],
    ['Jaguars',980680755],
    ['Jets',980680756],
    ['Lions',980680757],
    ['Packers',980680759],
    ['Panthers',980680760],
    ['Patriots',980680761],
    ['Raiders',980680762],
    ['Rams',980680763],
    ['Ravens',980680764],
    ['Saints',980680765],
    ['Seahawks',980680766],
    ['Steelers',980680767],
    ['Texans',980680768],
    ['Titans',980680769],
    ['Vikings',980680770]
]);

app.set('port', (process.env.PORT || 3001)); 

app.use(cors());

app.get('/', (req, res) => { 
    res.send('Backend for isleofmadden.com'); 
});
app.get('/api/coaches', (req, res) => { 
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    }); 
    let result = {}; 
    con.query("select * from coaches", (err, sqlRes) => { 
        if (err) res.sendStatus(500); 
        else { 
            res.send(sqlRes);
        }
    });

    con.end();
})

app.get('/api/coach/:teamName', (req, res) => {
    const {params: {teamName},} = req;
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    }); 
    let result = {}; 
    let sql = SQL`select * from coaches where teamName = ${teamName}`; 
    con.query(sql, (err, sqlRes) => { 
        if (err) res.sendStatus(500); 
        else { 
            res.send(sqlRes);
        }
    })
    con.end();
})

app.get('/api/gamestats/:gameId', (req, res) => { 
    const {params: {gameId}, } = req;
    +gameId;
    let schedulesDone = false, passingDone = false, rushingDone = false, defDone = false, receivingDone = false, sent = false; 
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    })
    let response = {}; 
    let sql = "select awayTeamId, homeTeamId, awayScore, homeScore from schedules where scheduleId = ?";
    con.query(sql, [gameId], (err, sqlRes) => {
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        sqlRes[0].awayTeam = teamIdToName.get(sqlRes[0].awayTeamId); 
        sqlRes[0].homeTeam = teamIdToName.get(sqlRes[0].homeTeamId);
        response['game'] = sqlRes;
        schedulesDone = true;
        if (schedulesDone && passingDone && rushingDone && defDone && receivingDone && !sent) { 
            sent = true;
            res.send(response);
        }
    }) 
    sql = "select defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs, defTotalTackles, fullName, teamId from defensive_stats where scheduleId = ? and (defSacks > 1 or defInts >= 1 or defTDs >= 1)"; 
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
    sql = "select passAtt, passComp, passInts, passLongest, passerRating, passTDs, passYds, fullName, teamId from passing_stats where scheduleId = ?"; 
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
    sql = "select recCatches, recLongest, recTDs, fullName, teamId from receiving_stats where scheduleId = ? and (recTds >= 1 or recLongest >= 60 or recCatches > 7)"; 
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
    sql = "select rushAtt, rushLongest, rushFum, rushYds, rushTDs, fullName, teamId from rushing_stats where scheduleId = ? and (rushTDs >= 1 or rushYds > 100 or rushFum > 1)"; 
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
})


app.get('/api/currentweek/:seasonIndex', (req, res) => { 
    const {params: {seasonIndex}, } = req;
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    }); 
    let sql = SQL`select weekIndex, weekStatus from schedules where seasonIndex = ${seasonIndex}`; 
    con.query(sql, (err, sqlRes) => { 
        if (err) res.sendStatus(500); 
        else {
            let response = {}; 
            let setDefaultWeek = false; 
            let currentWeek = 1; 
            for (const game of sqlRes) { 
                if (!setDefaultWeek) { 
                    if (game.weekStatus === 1){ 
                        currentWeek = game.weekIndex; 
                        setDefaultWeek = true;
                    }
                }
            }
            response['currentWeek'] = currentWeek; 
            res.send(response);
        }  
    })
    con.end();
})

app.get('/api/leagueschedule/:seasonIndex/:weekIndex', (req, res) => { 
    const {params: {seasonIndex, weekIndex}, } = req;
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    }); 
    let sql = SQL`select homeTeamId, homeScore, awayTeamId, awayScore, weekIndex, weekStatus from schedules where weekIndex = ${weekIndex} and seasonIndex = ${seasonIndex}`;
    con.query(sql, (err, sqlRes) => {
        if (err) res.sendStatus(500); 
        else {
            for (game of sqlRes) { 
                if (game.homeTeamId === 0) { 
                    game['homeTeam'] = 'TBD';
                }else { 
                    game['homeTeam'] = teamIdToName.get(game.homeTeamId);
                }
                if (game.awayTeamId === 0) { 
                    game['awayTeam'] = 'TBD';
                }else { 
                    game['awayTeam'] = teamIdToName.get(game.awayTeamId);
                }
                
            }
            res.send(sqlRes); 
        }
    })
    con.end();
})  
   




let firstRun = true;
app.get('/api/allPlayers', (req, res) => {
    if (firstRun) { 
        console.log('in first run');
        let con = mysql.createConnection({ 
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw,
            "database": "tomvandy_isle_of_madden"
        }); 
        let sql = SQL`select firstName, lastName, devTrait, age, height, weight, playerBestOvr, speedRating, awareRating, position, teamId, rosterId from players order by concat(firstName, lastName) asc;`; 
        con.query(sql, (err, sqlRes) => { 
            if (err) res.sendStatus(500); 
            else {
                for (let player of sqlRes) { 
                    player['teamName'] = teamIdToName.get(player.teamId);
                }
                res.send(sqlRes);
                players = sqlRes; 
            }
        })
        playerDate = new Date(Date.now());
        firstRun = false;
        con.end();
    } else { 
        let nowDate = new Date(Date.now());
        if (playerDate.getHours() + 2 < nowDate.getHours()) {
            console.log('in second run, fetching players'); 
            let con = mysql.createConnection({ 
                "host": process.env.host,
                "user": process.env.user,
                "password": process.env.pw,
                "database": "tomvandy_isle_of_madden"
            }); 
            let sql = SQL`select firstName, lastName, devTrait, age, height, weight, playerBestOvr, speedRating, awareRating, teamId from players order by concat(firstName, lastName) asc;`; 
            con.query(sql, (err, sqlRes) => { 
                if (err) res.sendStatus(500); 
                else {
                    for (let player of sqlRes) { 
                        player['teamName'] = teamIdToName.get(player.teamId);
                    } 
                    res.send(sqlRes); 
                    players = sqlRes;
                }
            })
            playerDate = Date.now();
            con.end();
        }else{ 
            console.log('in second run, using players array');
            res.send(players); 
        }
    }
   
})

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
    let teamInfoDone = false, teamCoachDone = false, teamStatsDone = false, teamRosterDone = false, teamSchedules = false, sent = false;
    let response = {};
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    let sql = SQL`select * from teams where teamName = ${teamName}`;
    con.query(sql, (err, sqlRes) => {
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
    sql = SQL`select coachName from coaches where teamName = ${teamName}`;
    con.query(sql, (err, sqlRes) => { 
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
    
    sql = SQL`select * from team_stats where teamId = ${teamNameToID.get(teamName)} and weekIndex < 23 ORDER BY (weekIndex)`; 
    con.query (sql, (err, sqlRes) => { 
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
    sql = SQL`select * from players where teamId = ${teamNameToID.get(teamName)} ORDER BY playerBestOvr desc`;   
    con.query(sql, (err, sqlRes) => { 
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
    sql = SQL`select * from schedules where weekIndex < 24 and (homeTeamId = ${teamNameToID.get(teamName)} or awayTeamId = ${teamNameToID.get(teamName)}) and seasonIndex = 1 order by (weekIndex) asc`; 
    con.query(sql, (err, sqlRes) =>  {
        if (err) {
            sent = true;
            res.sendStatus(500); 
        }
        for (const week of sqlRes) { 
            if (week.awayTeamId === teamNameToID.get(teamName)) { 
                week.awayTeam = teamName
            }else { 
                week.awayTeam = teamIdToName.get(week.awayTeamId);
            }
            if (week.homeTeamId === teamNameToID.get(teamName)) { 
                week.homeTeam = teamName;
            }else { 
                week.homeTeam = teamIdToName.get(week.homeTeamId); 
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

app.get('/api/seasonstats/:year/:position/:playerId', (req, res) => { 
    const {params: {year, position, playerId}, } = req; 
    let con = mysql.createConnection({
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    let sql;

    con.end();
})

app.get('/api/player/:rosterId', (req, res) => { 
    const {params: {rosterId}, } = req; 
    let response = {};
    let sql = SQL`SELECT p.*, t.primaryColor, t.secondaryColor, t.teamName from players p, teams t where p.teamId = t.teamId and p.rosterId = ${rosterId};`; 
    let con = mysql.createConnection({ 
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    con.query(sql, (err, sqlRes) => { 
        if (err) res.send(404); 
        response['player'] = sqlRes[0];
        let position = sqlRes[0].position;
        if (position === 'qb' || position === 'QB') {
            let secondSql =SQL`SELECT r.rushAtt, r.rushBrokenTackles, r.rushFum, r.rushLongest, r.rushPts, r.rushTDs, r.rushToPct, r.rush20PlusYds, r.rushYds, r.rushYdsPerAtt, r.rushYdsPerGame,p.passAtt, p.passComp,
             p.passCompPct, p.passInts, p.passLongest, p.passPts, p.passerRating, p.passSacks, p.passTDs, p.passYds, p.passYdsPerGame, p.fullName, p.weekIndex, pl.teamId, sch.awayTeamId, sch.homeTeamId
            FROM passing_stats p LEFT JOIN rushing_stats r ON p.rosterId = r.rosterId AND p.weekIndex = r.weekIndex AND p.scheduleId = r.scheduleId 
            LEFT JOIN players pl ON pl.rosterID = p.rosterId LEFT JOIN schedules sch ON sch.scheduleId = p.scheduleId WHERE p.rosterId = ${rosterId} AND p.seasonIndex = 1 ORDER BY (p.weekIndex) ASC;`;
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
                console.log('in second query');
                console.log(err);
                console.log(sql);
                if (err) res.sendStatus(500);
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
                    console.log(`Away: ${week.awayTeamId} Home: ${week.homeTeamId}`); 
                    if (week.awayTeamId === week.teamId){
                        console.log('in first if');
                        week['opponent'] = teamIdToName.get(week.hometeamId);
                    }
                    if (week.homeTeamId === week.teamId){
                        console.log('in second if');
                        week['opponent'] = teamIdToName.get(week.awayTeamId);
                    }
                    console.log(`Opp: ${week.opponent}`);
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
                con.end()
            })
    
    
        } else if (position === 'HB' || position === 'hb' || position === 'FB' || position === 'fb'){
            sql = SQL`select ru.fullName, ru.rushAtt, ru.rushBrokenTackles, ru.rushFum, ru.rushLongest, ru.rushPts, ru.rushTDs, ru.rushToPct, ru.rush20PlusYds, 
            ru.rushYds, ru.rushYdsPerAtt, ru.rushYdsPerGame, re.recCatches, re.recCatchPct, re.recDrops, re.recLongest, re.recPts, re.recTDs, 
            re.recToPct, re.recYds, re.recYdsAfterCatch, re.recYdsPerGame, re.weekIndex from rushing_stats ru left join receiving_stats re ON ru.rosterId = re.rosterId and ru.weekIndex = re.weekIndex  and ru.scheduleId = re.scheduleId where ru.rosterId = ${rosterId} and re.seasonIndex = 1 order by (ru.weekIndex) asc`; 
    
            con.query(sql, (err, secondQuery)=> { 
                if (err || sqlRes === []) res.sendStatus(500) 
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
            sql = SQL`select recCatches, recCatchPct, recDrops, recLongest, recPts, recTDs, recYdsAfterCatch, recYacPerCatch, recYds, recYdsPerCatch, recYdsPerGame, fullName, weekIndex from receiving_stats where rosterId = ${rosterId} and seasonIndex = 1 order by (weekIndex) asc`;
            con.query(sql, (err, secondQuery) => { {
                if (err) {res.sendStatus(500);}
                else{
                    let weeklyStats = [];  
                    for (const week of secondQuery) {  
                        seasonStats.recCatches += week.recCatches; 
                        seasonStats.recDrops += week.recDrops; 
                        if (week.recLongest > seasonStats.recLongest) seasonStats.recLongest = week.recLongest; 
                        seasonStats.recPts += week.recPts;
                        seasonStats.recTDs += week.recTDs; 
                        seasonStats.recYdsAfterCatch += week.recYdsAfterCatch; 
                        seasonStats.recYac += (week.recYacPerCatch * week.recCatches); 
                        seasonStats.recYds += week.recYds;
                        weeklyStats.push(week);
                    }
                    seasonStats.recYdsPerGame = sqlRes[0].recYdsPerGame;
                    seasonStats.recYdsPerCatch = (seasonStats.recYds / seasonStats.recCatches); 
                    seasonStats.name = secondQuery[0].fullName;
                    response.weeklyStats = weeklyStats; 
                    response.seasonStats = seasonStats;  
                    res.send(response);
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
            sql = SQL`select defCatchAllowed, defDeflections, defForcedFum, defFumRec, defInts, defIntReturnYds, defPts, defSacks, defSafeties, defTDs, defTotalTackles, fullName, weekIndex from defensive_stats where seasonIndex = 1 and rosterId = ${rosterId} order by (weekIndex) asc`; 
            con.query(sql, (err, secondQuery) => { 
                if (err) res.sendStatus(500);
                else { 
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
                        weeklyStats.push(week);
                        seasonStats.name = secondQuery[0].fullName;
                    }
                    response.weeklyStats = weeklyStats; 
                    response.seasonStats = seasonStats;
                    res.send(response);
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
            sql = SQL`select p.puntsBlocked, p.puntsIn20, p.puntLongest, p.puntTBs, p.puntNetYds, p.puntAtt, p.puntYds, p.fullName, k.kickoffAtt, k.kickoffTBs, p.weekIndex from punting_stats p left join kicking_stats k ON p.rosterId = k.rosterId and p.scheduleId = k.scheduleId and p.weekIndex = k.weekIndex where p.seasonIndex = 1 and p.rosterId = ${rosterId} order by (p.weekIndex) asc`; 
            con.query(sql, (err, secondQuery) => { 
                if (err) {
                    res.sendStatus(500);
                    console.log(err); 
                }
                    
                else {
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
                        weeklyStats.push(week); 
                    }
                    seasonStats.puntNetYdsPerAtt = seasonStats.puntNetYds / seasonStats.puntAtt; 
                    seasonStats.puntYdsPerAtt = seasonStats.puntYds / seasonStats.puntAtt; 
                    seasonStats.name = secondQuery[0].fullName;
                    response.seasonStats = seasonStats; 
                    response.weeklyStats = weeklyStats; 
                    res.send(response);
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
            sql = SQL`select kickPts, fGAtt, fG50PlusAtt, fG50PlusMade, fGLongest, fGMade, kickoffAtt, kickoffTBs, xPAtt, xPMade, xPCompPct, fullName, weekIndex from kicking_stats where seasonIndex = 1 and rosterId = ${rosterId} order by (weekIndex) asc`;
            con.query(sql, (err, secondQuery) => { 
                if (err) res.sendStatus(500); 
                else {
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
                        weeklyStats.push(week);
                    }
                    seasonStats.fgCompPct = seasonStats.fgMade / seasonStats.fgAtt; 
                    seasonStats.xpCompPct = seasonStats.xpMade / seasonStats.xpAtt;
                    seasonStats.name = secondQuery[0].fullName;
                    response.weeklyStats = weeklyStats; 
                    response.seasonStats = seasonStats;
                    res.send(response); 
                    con.end();
                }
            })
        }else { 
            res.send(response);
        }
    })


    
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

app.get('/api/playerSearch?', (req, res) => { 
    let sql; 
    let commonCols = "firstName, lastName, devTrait, age, height, weight, playerBestOvr, teamId, position, rosterId"; 
    console.log(req.query);
    if (!req.query.position || req.query.position == "Any") { 
        sql = `SELECT ${commonCols}, speedRating, awareRating `; 
    }else { 
        if (req.query.position === "QB"){ 
            sql = `SELECT ${commonCols}, throwPowerRating, throwAccRating, throwOnRunRating, throwAccShortRating, throwAccMedRating, throwAccDeepRating, speedRating, awareRating, playActionRating, breakSackRating, throwUnderPressureRating`; 
        }else if (req.query.position === "HB"){ 
            sql = `SELECT ${commonCols}, awareRating, speedRating, strengthRating, agilityRating, truckRating, jukeMoveRating, changeOfDirectionRating, spinMoveRating, stiffArmRating, carryRating, breakTackleRating, accelRating, bCVRating`; 
        }else if (req.query.position === "FB"){ 
            sql = `SELECT ${commonCols}, carryRating, impactBlockRating, leadBlockRating, runBlockRating, strengthRating, speedRating, truckRating, accelRating, agilityRating, catchRating, stiffArmRating, passBlockRating, breakTackleRating`; 
        }else if(req.query.position === "TE"){ 
            sql = `SELECT ${commonCols}, speedRating, catchRating, cITRating, specCatchRating, routeRunShortRating, routeRunMedRating, routeRunDeepRating, jumpRating, runBlockRating, impactBlockRating, passBlockRating, leadBlockRating, awareRating, breakTackleRating`; 
        }else if (req.query.position === "WR"){
            sql = `SELECT ${commonCols}, speedRating, accelRating, routeRunShortRating, routeRunMedRating, routeRunDeepRating, catchRating, cITRating,  specCatchRating, jumpRating, releaseRating, agilityRating`; 
        }else if(req.query.position === "LT" || req.query.position === "LG" || req.query.position === "C" || req.query.position === "RG" || req.query.position === "RT" || req.query.position === "OL") { 
            sql = `SELECT ${commonCols}, strengthRating, runBlockRating, runBlockPowerRating, runBlockFinesseRating, runBlockRating, passBlockRating, passBlockPowerRating, passBlockFinesseRating, leadBlockRating, impactBlockRating, awareRating, position`; 
        }else if (req.query.position === "LE" || req.query.position === "RE"){ 
            sql = `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating, agilityRating`; 
        }else if (req.query.position == "DT") {
            sql = `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating`;
        }else if (req.query.position === "LOLB"  || req.query.position === "ROLB"){ 
            sql = `SELECT ${commonCols}, speedRating, tackleRating, powerMovesRating, finesseMovesRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, hitPowerRating, blockShedRating, awareRating, strengthRating`; 
        }else if (req.query.position === "MLB" || req.query.position === "LB") { 
            sql = `SELECT ${commonCols}, speedRating, tackleRating, hitPowerRating, strengthRating, powerMovesRating, finesseMovesRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, blockShedRating, awareRating`
        }else if (req.query.position === "CB") { 
            sql = `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pressRating, hitPowerRating, catchRating, agilityRating, jumpRating, tackleRating`; 
        }else if (req.query.position === "SS"  || req.query.position === "FS"){
            sql = `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pursuitRating, tackleRating, hitPowerRating, catchRating, agilityRating, blockShedRating`;
        }else if (req.query.position === "K"  || req.query.position === "P" || req.query.position === "ST") { 
            sql = `SELECT ${commonCols}, kickPowerRating, kickAccRating, awareRating, speedRating, accelRating, strengthRating, throwPowerRating, throwAccShortRating, agilityRating, position`; 
        }else if (req.query.position === "DL") { 
            sql = `SELECT ${commonCols}, blockShedRating, powerMovesRating, finesseMovesRating, playRecRating, pursuitRating, hitPowerRating, strengthRating, tackleRating, awareRating, speedRating, accelRating, agilityRating, position`;
        }else if (req.query.position === "LB") {
            sql = `SELECT ${commonCols}, speedRating, tackleRating, powerMovesRating, finesseMovesRating, hitPowerRating, playRecRating, zoneCoverRating, manCoverRating, pursuitRating, agilityRating, accelRating, hitPowerRating, blockShedRating, awareRating, strengthRating, position`;
        }else if (req.query.position === "DB"){ 
            sql = `SELECT ${commonCols}, speedRating, accelRating, zoneCoverRating, manCoverRating, playRecRating, awareRating, pressRating, pursuitRating, hitPowerRating, tackleRating, agilityRating, jumpRating, tackleRating, blockShedRating, position`;
        }
    }
    sql += " FROM players"
    if (!req.query.position && !req.query.team && !req.query.name) { 
         
    }else { 
        let haveFirstParam = false; 
        if (req.query.position === "OL") { 
            sql +=  " WHERE position = 'LT' or position = 'LG' or position = 'C' or position = 'RG' or position = 'RT'"; 
            haveFirstParam = true;
        }else if (req.query.position === "DL") {
            sql += " WHERE position = 'RE' or position = 'DT' or position = 'LE'"; 
            haveFirstParam = true;
        }else if (req.query.position === "LB") { 
            sql += " WHERE position = 'LOLB' or position = 'MLB' or position = 'ROLB'"; 
            haveFirstParam = true;
        }else if (req.query.position === "DB"){ 
            sql += " WHERE position = 'CB' or position = 'FS' or position = 'SS'"; 
            haveFirstParam = true;
        }else if (req.query.position === "ST") { 
            sql += " WHERE position = 'K' or position = 'P'"; 
            haveFirstParam = true;
        }else if (req.query.position && req.query.position != "Any"){ 
            sql += " WHERE";
            sql += ` position='${req.query.position}'`; 
                haveFirstParam = true;
            
        }
        if (req.query.team && req.query.team != "Any") {
            if (haveFirstParam) { 
                sql += ` and teamId=${req.query.team}`; 
            }else { 
                sql += " WHERE";
                sql += ` teamId=${req.query.team}`; 
                haveFirstParam = true;
            }
            
        }
        if(req.query.name) { 
            if (haveFirstParam) { 
                sql += ` and CONCAT(UPPER(firstName),' ', UPPER(lastName)) LIKE '%${req.query.name}%'`; 
            } else { 
                sql += ` WHERE CONCAT(UPPER(firstName),' ', UPPER(lastName)) LIKE '%${req.query.name}%'`;
            }
        }
    }
    sql += " ORDER BY CONCAT(lastName, firstName);"; 
    let con = mysql.createConnection({ 
        "host": process.env.host,
        "user": process.env.user,
        "password": process.env.pw,
        "database": "tomvandy_isle_of_madden"
    });
    con.query(sql, (err, sqlRes) => {
        console.log(sql);
        console.log(err);
        if (err) {res.send(500);} 
        else {
            for (let player of sqlRes){  
                player['teamName'] = teamIdToName.get(player.teamId);
            }
            res.send(sqlRes); 
        }
    })
    con.end(); 
    console.log(sql);
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
 /*  
                *   the scheduleIds are re-used every season. add 10,000 to each scheduleId for each season that it is away from the start.
                *   eg season 2 = 10,000; season 3 = 20,000; season 4 = 30,000; etc
                */
const adjustId = (scheduleId, seasonIndex) => { 
    return scheduleId + ((seasonIndex - 0) * 10000); 
}

let counter = 0; 
app.post('/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => { 
    let body = ''; 

    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 

    req.on('end', () => {
        const {params: {dataType, weekType},} = req; 
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
                stat.weekIndex++;       
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
            let stats = json['playerReceivingStatInfoList'];
            for (let stat of stats) {


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
        let sql;
        for (let player of json) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            
            // 118 values
            sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryRating, injuryLength, injuryType,
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
                ${player.homeTown}, ${player.impactBlockRating},${player.injuryRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIR}, ${player.isOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
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
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryRating=VALUES(injuryRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr),
                    playerSchemeOvr=VALUES(playerSchemeOvr), posCatchTrait=VALUES(posCatchTrait), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), pursuitRating=VALUES(pursuitRating), 
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
        const abilities = []; 
        for (let player of json) { 
            if (player.teamId == 0) { 
                player.teamId = 1;
            }
            // 118 values
            let sql = SQL`INSERT INTO players (accelRating, age, agilityRating, awareRating, bCVRating, bigHitTrait, birthDay, birthMonth, birthYear, blockShedRating, breakSackRating, breakTackleRating, cITRating, capHit,
                capReleaseNetSavings, capReleasePenalty, carryRating, catchRating, changeOfDirectionRating, clutchTrait, college, confRating, contractBonus, contractLength, contractSalary, contractYearsLeft, coverBallTrait, dLBullRushTrait, 
                dLSpinTrait, dLSwimTrait, desiredBonus, desiredLength, desiredSalary, devTrait, draftPick, draftRound, dropOpenPassTrait, durabilityGrade, experiencePoints, feetInBoundsTrait, fightForYardsTrait,
                finesseMovesRating, firstName, forcePassTrait, hPCatchTrait, height, highMotorTrait, hitPowerRating, homeState, homeTown, impactBlockRating, injuryRating, injuryLength, injuryType,
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
                ${player.homeTown}, ${player.impactBlockRating},${player.injuryRating}, ${player.injuryLength}, ${player.injuryType}, ${player.intangibleGrade}, ${player.isActive}, ${player.isFreeAgent}, ${player.isOnIR}, ${player.isOnPracticeSquad}, ${player.jerseyNum}, ${player.jukeMoveRating}, ${player.jumpRating},
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
                desiredSalary=VALUES(desiredSalary), devTrait=VALUES(devTrait), durabilityGrade=VALUES(durabilityGrade), experiencePoints=VALUES(experiencePoints), finesseMovesRating=VALUES(finesseMovesRating), impactBlockRating=VALUES(impactBlockRating), injuryRating=VALUES(injuryRating), injuryLength=VALUES(injuryLength), 
                injuryType=VALUES(injuryType), intangibleGrade=VALUES(intangibleGrade), isActive=VALUES(isActive), isFreeAgent=VALUES(isFreeAgent), isOnIr=VALUES(isOnIr), isOnPracticeSquad=VALUES(isOnPracticeSquad), jerseyNum=VALUES(jerseyNum),
                    jukeMoveRating=VALUES(jukeMoveRating), jumpRating=VALUES(jumpRating), kickAccRating=VALUES(kickAccRating), kickPowerRating=VALUES(kickPowerRating), kickRetRating=VALUES(kickRetRating), 
                    leadBlockRating=VALUES(leadBlockRating), legacyScore=VALUES(legacyScore), manCoverRating=VALUES(manCoverRating), passBlockFinesseRating=VALUES(passBlockFinesseRating), passBlockPowerRating=VALUES(passBlockPowerRating), 
                    passBlockRating=VALUES(passBlockRating), physicalGrade=VALUES(physicalGrade), playActionRating=VALUES(playActionRating), playRecRating=VALUES(playRecRating), playerBestOvr=VALUES(playerBestOvr),
                    playerSchemeOvr=VALUES(playerSchemeOvr), posCatchTrait=VALUES(posCatchTrait), position=VALUES(position), powerMovesRating=VALUES(powerMovesRating), pressRating=VALUES(pressRating), productionGrade=VALUES(productionGrade), pursuitRating=VALUES(pursuitRating), 
                    reSignStatus=VALUES(reSignStatus), releaseRating=VALUES(releaseRating), routeRunDeepRating=VALUES(routeRunDeepRating), routeRunMedRating=VALUES(routeRunMedRating), routeRunShortRating=VALUES(routeRunShortRating), 
                    runBlockFinesseRating=VALUES(runBlockFinesseRating), runBlockPowerRating=VALUES(runBlockPowerRating), runBlockRating=VALUES(runBlockRating), runStyle=VALUES(runStyle), scheme=VALUES(scheme), sizeGrade=VALUES(sizeGrade), 
                    skillPoints=VALUES(skillPoints), specCatchRating=VALUES(specCatchRating), speedRating=VALUES(speedRating), spinMoveRating=VALUES(spinMoveRating), staminaRating=VALUES(staminaRating), stiffArmRating=VALUES(stiffArmRating),
                    strengthRating=VALUES(strengthRating), tackleRating=VALUES(tackleRating), teamId=VALUES(teamId), teamSchemeOvr=VALUES(teamSchemeOvr), throwAccDeepRating=VALUES(throwAccDeepRating), throwAccMedRating=VALUES(throwAccMedRating),
                    throwAccRating=VALUES(throwAccRating), throwAccShortRating=VALUES(throwAccShortRating), throwOnRunRating=VALUES(throwOnRunRating), throwPowerRating=VALUES(throwPowerRating), throwUnderPressureRating=VALUES(throwUnderPressureRating), 
                    toughRating=VALUES(toughRating), truckRating=VALUES(truckRating), weight=VALUES(weight), yACCatchTrait=VALUES(yACCatchTrait), yearsPro=VALUES(yearsPro), zoneCoverRating=VALUES(zoneCoverRating)`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;
                })
                
            
            
            if (player.signatureSlotList !== undefined){
                for (let ability of player.signatureSlotList){
                    if (ability.signatureAbility.signatureLogoId !== 0){
                        ability.abilityId = ability.signatureAbility.signatureLogoId + player.rosterId; 
                        let sql = SQL`INSERT INTO player_abilities (abilityId, abilityTitle, abilityLogo, abilityDescription, rosterId) VALUES (${ability.abilityId}, ${ability.signatureAbility.signatureTitle}, ${ability.signatureAbility.signatureLogoId}, ${ability.signatureAbility.signatureDescription}, ${player.rosterId}) ON DUPLICATE KEY UPDATE abilityId=${ability.abilityId}, abilityLogo=VALUES(abilityLogo)`;
                        con.query(sql, (err, res) => {
                            if (err) throw err;
                     })
                    }

                }
            }
        
            }
        con.end();
        res.sendStatus(200);
    });
});


app.listen(app.get('port'), ()=>{ 
    console.log('Running on part', app.get('port'));
});
