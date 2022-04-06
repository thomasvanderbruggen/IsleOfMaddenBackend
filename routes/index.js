import express from 'express'; 
import teams from '../controllers/teams';
import weekly from '../controllers/weekly';
import coaches from '../controllers/coaches'
import home from '../controllers/home';
import gamestats from '../controllers/gamestats';
import schedules from '../controllers/schedules';
import players from '../controllers/players';

const router = express.Router()

// -------------- POST ROUTES --------------
// These routes are all sent via the Madden
// Franchise Companion App. They include all
// data relevant to the franchise indicated by
// the :leagueId parameter

router.post('/:platform/:leagueId/leagueTeams', teams.teamInfo); 
router.post('/:platform/:leagueId/standings', teams.standings); 
router.post('/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', weekly.weeklyStats); 
router.post('/:platform/:leagueId/freeagents/roster', teams.roster); 
router.post('/:platform/:leagueId/team/:teamId/roster', teams.roster); 
// /retirements is used at the start of offseason to determine who has retired
router.post('/retirements/:leagueId/team/:teamId/roster', teams.retirements);
router.post('/retirements/:platform/:leagueId/team/freeagents/roster', teams.retirements); 


// -------------- GET ROUTES --------------
router.get('/', home); 
router.get('/api/coach/:teamName', coaches.coachByTeamName);
router.get('/api/gamestats/:gameId', gamestats.statsById); 
router.get('/api/leagueSchedule', schedules.leagueSchedule); 
router.get('/api/leagueSchedule/:week', schedules.leagueScheduleByWeek); 
router.get('/api/allPlayers', players.allPlayers); 
router.get('/api/team/:teamName', teams.teamByName); 
router.get('/api/roster/:teamId', teams.rosterById); 
// router.get('/api/seasonstats/:year/:position/:playerId', players.seasonStats); 
router.get('/api/player/:playerId', players.playerById);
router.get('/api/playerSearch?', players.search); 
router.get('/api/standings', teams.rank);
router.get('/api/conferencestandings/:conference', teams.conferenceStandings); 
router.get('/api/divisionstandings/:division', teams.divisionStandings); 
router.get('/api/leagueleaders', players.leagueLeaders);  


export default router;
