import mysql from 'mysql2/promise';
import { dbConfig } from '../../utils';

/*
    Retrieves the top 10 Running Backs in the league
*/
export const hbLeadersQuery = async (seasonIndex) => {
    const con = await mysql.createConnection(dbConfig);
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                fullName,
                SUM(rushAtt) 'rushAtt',
                SUM(rushYds) 'rushYds',
                SUM(rushTDs) 'rushTDs',
                MAX(rushLongest) 'rushLongest'
            FROM
                rushing_stats
            WHERE 
                seasonIndex = ?
            GROUP BY playerId
            ORDER BY SUM(rushYds) DESC , SUM(rushTDs) DESC
            LIMIT 10; 
            `, [seasonIndex])
        con.end();
        return rows;
    }catch (err) {
        console.log(err); 
        con.end(); 
        return false;
    }

}

export default hbLeadersQuery; 