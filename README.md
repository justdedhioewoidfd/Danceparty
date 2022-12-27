
# Gameserver

DanceParty Gameserver is a central server that handles services like JMCS, WDF and Galaxy.

**GAMESERVER IS CURRENTLY UNDER EARLY ALPHA, WHICH MEANS A LOT OF STUFF YOU SEE RIGHT NOW WILL CHANGE... A LOT.**

## Services

- **JMCS** (Jean Mich Central Server)
    
    Handles such services like leaderboards, profiles, online maps, JD Wall...

- **WDF** (World Dance Floor)

    All World Dance Floor data goes through WDF. Playlist, status, parties...

- **Galaxy**

    Galaxy handles, serves and stores songs database for JMCS and WDF.
    It is not an official service, we made it internally for Gameserver.


### Requirements
- Node.JS *(14 or higher)*
- PM2 *(install via NPM)*

### How to install/use?
```
git clone https://github.com/DancePartyOnline/gameserver.git
cd gameserver
npm i
pm2 start ecosystem.json
```
Using the code block above in your terminal will clone the server, 
install all modules and start **JMCS** and **WDF** with PM2.

#### Using command line
If you don't want to run the server with PM2 or want to run specific service,
you can always use the command line.
```
Usage: DanceParty GS [options]

Initiate DanceParty GS services

Options:
  -V, --version                output the version number
  -s, --service <serviceName>  service name to initiate
  -e, --env <envName>          enviroment for the service (default: "LOCAL")
  -h, --help                   display help for command
```
`node app.js --service jeanmich --env local` will start JMCS in local enviroment.

`node app.js --service wdf --env dev` will start WDF in dev enviroment.

## Contribute
Currently we don't accept any contribution due to the current state of Gameserver.
