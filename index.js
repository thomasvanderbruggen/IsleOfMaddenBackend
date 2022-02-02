const express = require('express'); 
const mysql = require('mysql');
const app = express(); 
const SQL = require('sql-template-strings');
const cors = require('cors');
const {realLeagueId} = require('./resources/leagueId.json');
const { coaches, teamCoach, gameStats, leagueSchedule, allPlayers, teamByTeamName, teamRoster, seasonStats, playerInfo, powerRank, playerSearch, standings, conferenceStandings, divisionStandings, leagueLeaders} = require('./functions/getFunctions');
const { leagueInfo, teamWeeklyStats, schedule, puntingWeeklyStats, passingWeeklyStats, defensiveWeeklyStats, kickingWeeklyStats, rushingWeeklyStats, receivingWeeklyStats, freeAgents, teamRosters } = require('./functions/postFunctions');
let teamsWithInfo = []; 


const pool = mysql.createPool({
    "host": process.env.host,
    "user": process.env.user,
    "password": process.env.pw,
    "database": "tomvandy_isle_of_madden"
})

app.set('port', (process.env.PORT || 3001)); 

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', (req, res) => { 
    res.send('Backend for isleofmadden.com'); 
});

app.get('/api/coaches', (req, res) => { 
    coaches(res);
})

app.get('/api/coach/:teamName', (req, res) => {
    const {params: {teamName},} = req;
    teamCoach(teamName, res);
})

app.get('/api/gamestats/:gameId', (req, res) => { 
    const {params: {gameId}, } = req;
    +gameId;
   gameStats(gameId, res);
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
               if (game.weekStatus === 1){
                   currentWeek = game.weekIndex;
                   break;
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
    leagueSchedule(seasonIndex, weekindex, res);
})  
   

app.get('/api/allPlayers', (req, res) => {
    allPlayers(res);
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
    teamByTeamName(teamName, res);
})

app.get('/api/roster/:teamId', (req, res) => { 
    const {params: {teamId},} = req;
    teamRoster(teamId, res);
})


app.get('/api/seasonstats/:year/:position/:playerId', (req, res) => { 
    const {params: {year, position, playerId}, } = req; 
    seasonStats();
    res.sendStatus(200);
})

app.get('/api/player/:rosterId', (req, res) => { 
    const {params: {rosterId}, } = req; 
   playerInfo(rosterId, res)
})

app.get('/api/powerranking/', (req, res) => { 
    let sql = "select cityName, teamName, totalWins, totalLosses, totalTies, primaryColor, secondaryColor from teams where teamId <> 1 order by teamRank ASC;"
    powerRank();
})

app.get('/api/playerSearch?', (req, res) => { 
    playerSearch(req.query.position, req.query.team, req.query.name);
})

app.get('/api/standings', (req, res) => {
    standings(res);
})

app.get('/api/conferencestandings/:conference', (req, res) => {
    const {params: {conference}, } = req; 
    conferenceStandings(conference, res);
})

app.get('/api/divisionstandings/:division', (req, res) => {
    const {params: {division}, } = req; 
    divisionStandings(division, res);
})

app.get('/api/leagueleaders', (req, res) => {
   leagueLeaders(res);
})


app.post('/:platform/:leagueId/leagueTeams', (req, res) => { 
    let {params: {leagueId}, } = req;
    leagueId = parseInt(leagueId);
    let body = ''; 
    req.on('data', chunk=>{ 
        body += chunk.toString();
    })
    req.on('end', () =>{ 
        if (leagueId === realLeagueId){
            const teams = JSON.parse(body)['leagueTeamInfoList'];
            console.log('----Teams----');
            for (const team of teams) { 
                teamsWithInfo.push(team); 
            }
            res.sendStatus(200);
        }else{
            res.sendStatus(500);
        }

    })
})


app.post('/:platform/:leagueId/standings', (req, res) => { 
    let {params: {leagueId}, } = req;
    leagueId = parseInt(leagueId);
    let body = ''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 
    req.on('end', () => { 
        if (leagueId === realLeagueId){
            const teams = JSON.parse(body)['teamStandingInfoList'];
            leagueInfo(teams, teamsWithInfo, pool);
            teamsWithInfo = []; 
            res.sendStatus(200); 
        }else{
            res.sendStatus(500);
        }

    });
})


app.post('/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => { 
    let {params: {dataType, weekType, leagueId},} = req; 
    leagueId = parseInt(leagueId);
    let body = ''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 

    req.on('end', () => {
        if (leagueId === realLeagueId){
            let json = JSON.parse(body)
            if (dataType === 'teamstats'){  
                let stats = json['teamStatInfoList'];
                teamWeeklyStats(stats, weekType, pool);
    
            }else if (dataType === 'schedules'){ 
                let games = json['gameScheduleInfoList']; 
                schedule(games, weekType, pool);
            }else if (dataType === 'punting'){ 
                let stats = json['playerPuntingStatInfoList'];
                puntingWeeklyStats(stats, weekType, pool);
            }else if (dataType === 'passing'){ 
                let stats = json['playerPassingStatInfoList'];
                passingWeeklyStats(stats, weekType, pool);
            }else if (dataType === 'defense'){ 
                let stats = json['playerDefensiveStatInfoList']; 
                defensiveWeeklyStats(stats, weekType, pool);
            }else if (dataType === 'kicking'){ 
                let stats = json['playerKickingStatInfoList'];
                kickingWeeklyStats(stats, weekType, pool);
            }else if (dataType === 'rushing') {
                let stats = json['playerRushingStatInfoList']; 
                rushingWeeklyStats(stats, weekType, pool);
            }else if (dataType === 'receiving') { 
                let stats = json['playerReceivingStatInfoList'];
                receivingWeeklyStats(stats, weekType, pool);
            }
            res.sendStatus(200);
        }else{
            res.sendStatus(500);
        }
        
    });
});

app.post('/:platform/:leagueId/freeagents/roster', (req, res) => { 
    let {params: {leagueId}, } = req;
    leagueId = parseInt(leagueId);    
    let body =''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    });
    req.on('end', () => { 
        //console.log('----Free Agents----'); 
        if (leagueId === realLeagueId){
            const json = JSON.parse(body)['rosterInfoList'];        
            freeAgents(json, pool);
            res.sendStatus(200); 
        }else{
            res.sendStatus(500);
        }

    })
});

app.post('/:platform/:leagueId/team/:teamId/roster', (req, res) => { 
    let {params: {leagueId}, } = req;
    leagueId = parseInt(leagueId);
    let body = '';
    req.on('data', chunk => { 
        body += chunk.toString();
    }); 
    req.on('end', () => { 
       // console.log('---Team Rosters----'); 
        if (leagueId === realLeagueId){
            const json = JSON.parse(body)['rosterInfoList'];
            teamRosters(json, pool);
            res.sendStatus(200);
        }else{
            res.sendStatus(500);
        }

    });
});


app.listen(app.get('port'), ()=>{ 
    console.log('Running on part', app.get('port'));
});
