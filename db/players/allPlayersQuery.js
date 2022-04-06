import mysql from 'mysql2/promise'; 
import { dbConfig } from '../../utils';


/*
    Retrievs the generic information relevant to all positions on the field for all of the active players in the league. 
*/
export const allPlayersQuery = async () => {
    const con = await mysql.createConnection(dbConfig); 
    try {
        let [rows, fields] = await con.query(
            `SELECT 
                pl.firstName,
                pl.lastName, 
                pl.devTrait,
                pl.age,
                pl.height,
                pl.weight,
                pl.playerBestOvr,
                pl.speedRating,
                pl.awareRating,
                pl.position,
                pl.teamId,
                pl.playerId,
                t.teamName
            FROM
                players pl
                LEFT JOIN teams_temp t ON t.teamId = pl.teamId
            WHERE
                pl.isRetired = false
            ORDER BY 
                CONCAT(firstName, lastName) asc;
             `)
        con.end(); 
        return rows; 
    }catch (err){
        console.log(err); 
        con.end();
        return false;
    }
    

} 

export default allPlayersQuery;