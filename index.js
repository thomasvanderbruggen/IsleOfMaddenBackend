const express = require('express'); 
const mysql = require('mysql');
const app = express(); 
let teamInfoKeys = []; 
let teamStandingsKeys = [];
let teamsWithInfo = []; 
app.set('port', (process.env.PORT || 3001)); 

app.get('*', (req, res) => { 
    res.send('Testing'); 
});

app.post('/:platform/:leagueId/leagueTeams', (req, res) => { 
    let body = ''; 
    req.on('data', chunk=>{ 
        body += chunk.toString();
    })
    req.on('end', () =>{ 
        const teams = JSON.parse(body)['leagueTeamInfoList'];
        console.log('----Teams----');
        Object.keys(teams[0]).forEach(key => { 
            console.log(`${key} ${teams[0][key]}`);
        });
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
            console.log(key);
        })
        for (let i = 0; i < teamsWithInfo.length; i++){ 
            teams[i] = {...teams[i], ...teamsWithInfo[i]};  
        }
        console.log('----Merged----');
        Object.keys(teams[0]).forEach(key => { 
            console.log(`${key} ${teams[0][key]} ${typeof teams[0][key]}`);
        })
        let con = mysql.createConnection({
            "host": process.env.host,
            "user": process.env.user,
            "password": process.env.pw
        });
        let sqlTeams = [];
        let counter = 0; 
        for (team of teams){ 
            
            sqlTeams[0] 
        }
        con.connect(err => { 
            if (err) console.log(err);
            for (team of teams){
                let sql = `INSERT INTO teams (awayLosses, awayTies, calendarYear, conferenceId, confLosses, conferenceName, confTies, confWins, capRoom, capAvailable, capSpent, defPassYds, defPassYdsRank, defRushYds, defRushYdsRank, defTotalYds, defTotalYdsRank, divisionId, divLosses, divisionName, divTies, divWins, homeLosses, homeTies, homeWins, netPts, offPassYds, offPassYdsRank, offRushYds, offRushYdsRank, offTotalYds, offTotalYdsRank, ptsAgainstRank, ptsForRank, playoffStatus, prevRank, teamRank, seed, seasonIndex, stageIndex, totalLosses, totalTies, totalWins, teamId, teamName, teamOvr, tODiff, weekIndex, winLossStreak, winPct, abbrName, cityName, defScheme, injuryCount, logoId, nickName, offScheme, ovrRating, primaryColor, secondaryColor, userName) VALUES (${team.awayLosses}, ${team.awayTies}, ${team.calendarYear}, ${team.conferenceId}, ${team.confLosses}, ${team.conferenceName},${team.confTies}, ${team.confWins}, ${team.capRoom}, ${team.capAvailable}, ${team.capSpent}, ${team.defPassYds}, ${team.defPassYdsRank},${team.defRushYds}, ${team.defRushYdsRank}, ${team.defTotalYds}, ${team.defTotalYdsRank}, ${team.divisionId}, ${team.divLosses}, ${team.divisionName}, ${team.divTies}, ${team.divWins}, ${team.homeLosses}, ${team.homeTies}, ${team.homeWins}, ${team.netPts}, ${team.offPassYds}, ${team.offPassYdsRank}, ${team.offRushYds}, ${team.offRushYdsRank}, ${team.offTotalYds}, ${team.offTotalYdsRank}, ${team.ptsAgainstRank}, ${team.ptsAgainstRank},${team.ptsForRank}, ${team.playoffStatus}, ${team.prevRank}, ${team.rank}, ${team.seed}, ${team.seasonIndex}, ${team.stageIndex}, ${team.totalLosses},${team.totalTies}, ${team.totalWins}, ${team.teamId}, ${team.teamName}, ${team.teamOvr}, ${team.tODiff}, ${team.weekIndex}, ${team.winLossStreak},${team.winPct}, ${team.abbrName}, ${team.cityName}, ${team.defScheme}, ${team.injuryCount}, ${team.logoId}, ${team.nickName}, ${team.offScheme}, ${team.ovrRating}, ${team.primaryColor}, ${team.secondaryColor}, ${team.userName})`;
                con.query(sql, (err, res) => { 
                    if (err) throw err;

                })
            }
            
        })
        teamsWithInfo = []; 
        res.sendStatus(200); 
    });
})


app.post('/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => { 
    let body = ''; 

    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 

    req.on('end', () => {
        const {params: {dataType},} = req; 
        console.log(`----${dataType}----`); 
        //console.log(JSON.parse(body));
        res.sendStatus(200);
    })
});

app.post('/:platform/:leagueId/freeagents/roster', (req, res) => { 
    let body =''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    });
    req.on('end', () => { 
        console.log('----Free Agents----'); 
        //console.log(JSON.parse(body)); 
        res.sendStatus(200); 
    })
});

app.post('/:platform/:leagueId/team/:teamId/roster', (req, res) => { 
    let body = '';
    req.on('data', (req, res) => { 
        body += chunk.toString();
    }); 
    req.end('end', () => { 
        console.log('---Team Rosters----'); 
        //console.log(JSON.parse(body)); 
        res.sendStatus(200);
    });
});

app.listen(app.get('port'), ()=>{ 
    console.log('Running on part', app.get('port'));
});
