import asyncio
import json
import sys

import aiohttp

from understat import Understat

league = ""
year = ""
league = sys.argv[1]
year = sys.argv[2]

async def main(league: str, year: str):
    async with aiohttp.ClientSession() as session:
        understat = Understat(session)         
        data = await understat.get_teams(league,year),

        print(json.dumps(data))


loop = asyncio.get_event_loop()
loop.run_until_complete(main(league,year))