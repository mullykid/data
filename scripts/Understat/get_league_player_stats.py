import asyncio
import json
import sys

import aiohttp

from understat import Understat

player = ""
player = sys.argv[1]

async def main(player: str):
    async with aiohttp.ClientSession() as session:
        understat = Understat(session)         
        print(player)
        data = await understat.get_player_grouped_stats(player)

        print(json.dumps(data))


loop = asyncio.get_event_loop()
loop.run_until_complete(main(player))