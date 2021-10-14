const express = require('express'); 

const app = express(); 

app.set('port', (process.env.PORT || 3001)); 

app.get('*', (req, res) => { 
    res.send('Testing'); 
});

app.post('/:platform/:leagueId/standings', (req, res) => { 
    let body = ''; 
    req.on('data', chunk => { 
        body += chunk.toString(); 
    }); 
    req.on('end', () => { 
        console.log('----Teams----');
        const teams = JSON.parse(body)[teamStandingInfoList];
        for (team of teams){ 
            console.log(team[teamId]);
        }
        res.sendStatus(200); 
    });
})

app.post('/:platform/:leagueId/standings', (req, res) => { 
    let body = ''; 

    req.on('data', chunk =>{ 
        body += chunk.toString(); 
    }); 

    req.on('end', () => { 
        console.log('----Standings----'); 
        //console.log(JSON.parse(body)); 
        res.sendStatus(200); 
    });
});


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

app.post('/:username/:platform/:leagueId/team/:teamId/roster', (req, res) => { 
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
