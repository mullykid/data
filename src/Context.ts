import * as Express from 'express'
import ConfigHelper from './ConfigHelper'

const app = Express()

import {Options, PythonShell} from 'python-shell';

 
export async function initApplicationContext(configWrapper: any = new ConfigHelper()){

    let path = '.' + configWrapper.getConfigValue("scriptPath", "/scripts/Understat/")

    app.get('/api/players', function(req, res) {
        let team = req.query.team ? req.query.team : "All"
        let year = req.query.year ? req.query.year : 2020
        let options: Options = {
            mode: 'json',
            scriptPath: path,
            args: [team.toString(), year.toString()]
        };

        console.log('Running for %j %s', team, year);
        
        PythonShell.run('get_league_players.py', options, function (err, results) {
            handleResult(err, res, results)
        });

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
        
        PythonShell.run('get_league_player_stats.py', options, function (err, results) {
            handleResult(err, res, results)
        });

    });

    app.get('/api/team_stats', function(req, res) {
        let team = req.query.team ? req.query.team : ""
        let year = req.query.year ? req.query.year : 2020 //TO DO get current year
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
        let league = req.query.league ? req.query.league : ""
        let year = req.query.year ? req.query.year : 2020 //TO DO get current year
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