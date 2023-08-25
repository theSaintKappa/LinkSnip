# LinkSnip <img src="https://snip.gay/icon.png" height="24">

### Snip your long URLs in the snap of a finger! https://snip.gay

> ➡️ Add `?json` to the end of a sniped url to get the raw json response instead of being redirected.

## Installation & Running

-   Clone this repository
-   Run

```bash
$ npm install
$ cd public
$ npm install
$ npm run build
$ cd ../
```

-   Create a `.env` file in the root directory and add the following:

```env
REDIS_URI=[your redis connection URL]
APP_URL=[your public app url]
```

-   Install nodemon globally with `npm install -g nodemon`
-   Run `npm run dev` to start the app locally

## API

### <b>POST</b> /api/new

#### Request headers:

```json
'Content-Type': 'application/json'
```

#### Request body:

```json
{ "url": "example.com" }
# Note: if you don't provide a url protocol, your snip will default to https
```

#### Example response:

```json
{
    snipId: "DjX",
    snipUrl: "https://snip.gay/DjX"
    redirectUrl: "https://github.com/theSaintKappa",
    createdAt: "2023-08-24T22:24:59.096Z",
    alreadyExisted: true
}
```

#### Example request:

```bash
$ curl --request POST \
    https://snip.gay/api/new \
    --header 'Content-Type: application/json' \
    --data '{ "url": "https://github.com/theSaintKappa" }'
```
