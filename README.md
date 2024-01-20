# yomiage-kun

## Prerequisites

- Node.js > v20

## setup

### create App and token

https://discord.com/developers/docs/getting-started

### set values to .env

create .env file and fill information

```bash
$ cp .env.sample .env
```

### install bot to server

access and add bot to your server:  
https://discord.com/api/oauth2/authorize?client_id=[BOT_CLIENT_ID]&permissions=19924992&scope=bot

BOT_CLIENT_ID is same as value in `.env` file you set.

### install dependencies

```bash
$ npm ci
```

### install dependencies (Mac)

```bash
$ brew install libtool autoconf automake
$ npm install pm2 -g
```

### start VOICEVOX engine

```bash
$ docker run -d --restart always --name voicevox-engine -p '50021:50021' voicevox/voicevox_engine:cpu-0.14.5
```

## run

### dev

```bash
$ npm run dev
```

### build

```bash
$ npm run build
```

### run

```bash
$ node dist/index.js
# if you use pm2, app settings are read from ecosystem.config.js
$ pm2 start
```

### ref

voicevox API reference: https://voicevox.github.io/voicevox_engine/api/
