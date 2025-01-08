

# Server
Runs 2 independent timers with 3 synchronized discord bots on each. Of the 3 bots, 1 is allows commands and the other 2 do not.

## Usage

### `npm install`
Installs the required dependencies

### `npm run dev`
Run the app in dev

### `node ./src/index.js`
Runs the app

## Configuration
Create a file named `.env` in the server directory.


Add the following lines: 

`SERVER_PORT=`
(Not required) Port where the server will run. Defaults to port 8000 if not specified.

`WEB_PORT=`
(Not required) Port where the web client is running in dev. Defaults to expect port 3000 if not specific.

`SERVER_URL=`
(Not required) URL where the server is hosted which will be linked in the timer embeds. Do not include / at the end or a port.

`LOGGING_CHANNEL_ID=`
(Not required) ID of the text channel where the bot log messages are sent.

Add the following lines for discord bots 1-6. Bots 1-3 are synchronized and bots 4-6 are synchronized. Bots 1 and 4 allow commands.

`DISCORD1_TOKEN=`
API Token for the bot found on discord developer portal

`DISCORD1_ID=`
API ID for the bot fond on discord developer portal

`DISCORD1_CHANNEL_ID=`
(Not required) ID of the voice channel where the bot will connect and send its embed.

`DISCORD1_ROLE_ID=`
(Not required) ID of the discord role that has permission to give command to the bot. If no role is set then everyone has permission.

(Not required) indicates that the timers can still be run without being given the value; however, the program will be missing the corresponding functionality. Values that are incorrect or invalid may prevent the timers from working.
