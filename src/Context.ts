import * as Express from 'express'
import ConfigHelper from './ConfigHelper'
import fetch from "node-fetch"
import { QueryParameters } from 'util-commons/QueryParametersEnconding'
import * as EJSON from 'util-commons/EjsonParser';

const app = Express()

import {Options, PythonShell} from 'python-shell';

interface IPlayers{
    league: string
    season: number
}
 
export async function initApplicationContext(configWrapper: any = new ConfigHelper()){

    let path = '.' + configWrapper.getConfigValue("scriptPath", "/scripts/Understat/")

    const getCurrentYear = () => {
        return new Date().getFullYear()
    }

    app.get('/api/players', async function(req, res) {
        let league = req.query.league ? req.query.league.toString() : "EPL"
        let season = req.query.season ? parseInt(req.query.season.toString()) : getCurrentYear()       
        let games = req.query.games ? parseInt(req.query.games.toString()) : undefined
        let position: string[] = req.query.position ? QueryParameters.decodeQueryParameterValue(req.query.position as string[]) : undefined         

        const bodyText = () => {
            let body = `league=${league}&season=${season}`
            body = games ? `${body}&n_last_matches=${games}` : body
            if (position.length > 2){
                for (let i=1;i<position.length-1;i++){                     
                    body = `${body}&positions%5B%5D=${position[i]}`               
                }
            }
            return body
        }
        let response = await fetch('https://understat.com/main/getPlayersStats/',{
            headers: {
                'Accept':'application/json',
                'Content-Type':'application/x-www-form-urlencoded'
            },
            method: "POST",
            body: bodyText() 
        })
        const data = await response.json();

        if (data.error){
            res.status(400).send({error: data.error.error_msg, status: "Fail"})  
        }
        else{
            res.status(200).send({results: data.response.players, status: "OK"})  
        }

    }); 

    app.get('/api/player_stats', function(req, res) {
        let playerID = req.query.playerid ? req.query.playerid : ""

        if (playerID === ""){
            throw "PlayerID not provided in API call"
        }

        let options: Options = {
            mode: 'json',
            scriptPath: path,
            args: [playerID.toString()]
        };
        
        console.log('Running for player %j', playerID);
        
        PythonShell.run('get_player_grouped_stats.py', options, function (err, results) {
            handleResult(err, res, results)
        });

    });

    app.get('/api/player_shots', function(req, res) {
        console.log(req.query.playerid)
        console.log(req.query.season)
        let playerId = req.query.playerid ? req.query.playerid.toString() : ""
        let season = req.query.season ? req.query.season.toString() : ""
        if (playerId === ""){
            throw "PlayerID not provided in API call"
        }

        if (season === ""){
            throw "Season not provided in API call"
        }

        let options: Options = {
            mode: 'json',
            scriptPath: path,
            args: [playerId, season] as any
        };
        
        console.log('Running for player %j %s', playerId, season);
        
        PythonShell.run('get_league_player_shots.py', options, function (err, results) {
            handleResult(err, res, results)
        });

    });

    app.get('/api/player_matches', function(req, res) {
        let playerId = req.query.playerid ? req.query.playerid.toString() : ""
        let season = req.query.season ? req.query.season.toString() : ""

        if (playerId === ""){
            throw "PlayerID not provided in API call"
        }

        if (season === ""){
            throw "Season not provided in API call"
        }

        let options: Options = {
            mode: 'json',
            scriptPath: path,
            args: [playerId, season] as any
        };
        
        console.log('Running for player %j %s', playerId, season);
        
        PythonShell.run('get_league_player_matches.py', options, function (err, results) {
            handleResult(err, res, results)
        });

    });

    app.get('/api/team_stats', function(req, res) {
        let team = req.query.team ? req.query.team : ""
        let year = req.query.year ? req.query.year : getCurrentYear() //TO DO get current year
        if (team === ""){  
             "Team not provided in API call"
        }
        let options: Options = {
            mode: 'json',
            scriptPath: path,
            args: [team.toString(), year.toString()]
        };

        console.log('Running for %j %s', team, year);
        
        PythonShell.run('get_team_stats.py', options, function (err, results) {
            handleResult(err, res, results)
        });

    }); 

    app.get('/api/teams', function(req, res) {
        let league = req.query.league ? req.query.league : "EPL"
        let year = req.query.year ? req.query.year : getCurrentYear()  // returns the current year //TO DO get current year
        if (league === ""){  
             "League not provided in API call"
        }
        let options: Options = {
            mode: 'json',
            scriptPath: path,
            args: [league.toString(), year.toString()]
        };

        console.log('Running for %j %s', league, year);
        
        PythonShell.run('get_teams.py', options, function (err, results) {
            handleResult(err, res, results)
        });

    }); 

    let port = configWrapper.getConfigValue("express.port", 80)
    
    app.listen(port, () => console.log('Application listening on port ' + port))
}

function handleResult(err:any, res:any, results: any){
    if (err) {
        res.send({error: err, status: "Fail"})    
    }
    else{
        // results is an array consisting of messages collected during execution
        if (res != undefined){
            res.send({results: results[0], status: "OK"})   
        }
        else{
            res.send({results: [], status: "No results returned"})   
        }
    }
}