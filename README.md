# LoR-discord-bot

## WIP
Learning how to make a discord bot :) This is a Legends of Runeterra Discord bot.
There is currently a typo with how Riot named their region image, its spelled "zuan" when its supposed to be "zaun".

## How to use
To be honest, I'm not 100% sure how to set this bot up from scratch, I personally followed [An Idiot's Guide](https://anidiots.guide/) to setup the Bot's account on Discord and code it. Walking through the initial setup, and then downloading this bot *should* work.

### Current Functionality:
- Getting card info
- Getting keyword info
- Getting full card art
- Basic API info (local player current match, last match, deck)

### This bot requires a config.json with these values:
- token: bot's auth token
- prefix: the prefix for bot commands (ie "!" if the commands are "!cardname zed")
- ownerID: your discord id

Example:

```json
{
    "token": "example",
    "riotAPIKey": "example",
    "prefix": "!",
    "ownerID": "example"
}
```

### Disclaimer
LoR-Bot isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games
or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are
trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
