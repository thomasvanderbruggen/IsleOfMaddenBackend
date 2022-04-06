import mysql from 'mysql2/promise';
import { dbConfig } from '../../utils';


/*
    Retrieves the top 10 Quarerbacks in the league
*/
export const qbLeadersQuery = async (seasonIndex) => {
    const con = await mysql.createConnection(dbConfig); 

    try {
        let [rows, fields] = await con.query(
            `SELECT 
                fullName,
                SUM(passAtt) 'passAtt',
                SUM(passComp) 'passComp',
                SUM(passYds) 'passYds',
                SUM(passTDs) 'passTDs'
            FROM
                passing_stats
            WHERE
                seasonIndex = ?
            GROUP BY playerId
            ORDER BY SUM(passYds) DESC, SUM(passTDs) DESC
            LIMIT 10
            `, [seasonIndex])

        con.end();
        return rows;
        
    }catch (err) {
        console.log(err); 
        con.end(); 
        return false;
    }
}

export default qbLeadersQuery;