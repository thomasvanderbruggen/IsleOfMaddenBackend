const express = require('express'); 

const app = express(); 
let teamInfoKeys = []; 
let teamStandingsKeys = []; 
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
        let team = teams[0]; 
        Object.keys(team).forEach(key => { 
            teamInfoKeys.push(key);
            console.log(key);
        })
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
        let team = teams[0]; 
        Object.keys(team).forEach(key => { 
            teamStandingsKeys.push(key);
            console.log(key);
        })
        console.log("Keys not included in teamStandingsKeys"); 
        for (key of teamInfoKeys) { 
            if (!teamStandingsKeys.includes(key)){ 
                console.log(key);
            }
        }
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
