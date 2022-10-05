import asyncio
import json
import sys

import aiohttp

from understat import Understat

player = ""
season = ""
player = sys.argv[1]
season = sys.argv[2]

async def main(player: str):
    async with aiohttp.ClientSession() as session:
        understat = Understat(session)         
        data = await understat.get_player_matches(player, season=season)

        print(json.dumps(data))


loop = asyncio.get_event_loop()
loop.run_until_complete(main(player))