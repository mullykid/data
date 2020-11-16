import asyncio
import json
import sys

import aiohttp

from understat import Understat

team = ""
year = ""
team = sys.argv[1]
year = sys.argv[2]

async def main(team: str, year: str):
    async with aiohttp.ClientSession() as session:
        understat = Understat(session)
        if team == "All":             
            data = await understat.get_league_players("epl", year)
        else:
            data = await understat.get_league_players("epl", year, {"team_title": team})

        print(json.dumps(data))


loop = asyncio.get_event_loop()
loop.run_until_complete(main(team, year))