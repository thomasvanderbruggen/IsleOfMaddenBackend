import express from 'express'; 
import currentWeek from './db/weekly/currentWeek.js';
import routes from './routes/index.js'; 
import { generateTeamIdConversions, dbConfig } from './utils/index.js';
import mysql from 'mysql2/promise'; 
import cors from 'cors'; 

const app = express(); 
app.set('port', process.env.PORT || 3001);

app.use(cors())

app.use('/', routes); 


let [seasonIndex, weekIndex] = await currentWeek(); 

app.set('currentSeason', seasonIndex); 
app.set('currentWeek', weekIndex); 
const [teamIdToName, teamNameToId] = await generateTeamIdConversions();
app.set('teamIdToName', teamIdToName);
app.set('teamNameToId', teamNameToId);  

console.log(seasonIndex); 
console.log(weekIndex); 

const pool = mysql.createPool({
  'host': dbConfig.host,
  'user': dbConfig.user,
  'database': dbConfig.database,
  'password': dbConfig.password, 
})

app.set('pool', pool); 

app.listen(app.get('port'), () => console.log('App listening on port 3000')); 




export default app;