import asyncio
import json
import sys

import aiohttp

from understat import Understat

year = ""
league = ""
league = sys.argv[1]
games = sys.argv[2]
year = sys.argv[3]

async def main(league: str, year: str, games: str):
    
    async with aiohttp.ClientSession() as session:
        options = {
            "n_last_matches": 1
        }
        if (games != "0"):
            options["n_last_matches"] = int(games)

        understat = Understat(session)
        data = await understat.get_league_players(league, year,position="F S",date_start="2022-08-08")
        
        print(json.dumps(data))


loop = asyncio.get_event_loop()
loop.run_until_complete(main(league, year, games))