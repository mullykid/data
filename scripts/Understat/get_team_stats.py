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
        data = await understat.get_team_stats(team,year)

        print(json.dumps(data))


loop = asyncio.get_event_loop()
loop.run_until_complete(main(team,year))