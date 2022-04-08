import express from 'express'; 
import currentWeek from './db/weekly/currentWeek.js';
import routes from './routes/index.js'; 
import { generateTeamIdConversions } from './utils/index.js';

const app = express(); 
app.set('port', process.env.PORT || 3001);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/', routes); 


let [seasonIndex, weekIndex] = await currentWeek(); 

app.set('currentSeason', 2); 
app.set('currentWeek', weekIndex); 
const [teamIdToName, teamNameToId] = await generateTeamIdConversions();
app.set('teamIdToName', teamIdToName);
app.set('teamNameToId', teamNameToId);  

console.log(seasonIndex); 
console.log(weekIndex); 

app.listen(app.get('port'), () => console.log('App listening on port 3000')); 




export default app;