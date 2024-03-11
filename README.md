# LinkSnip <img src="https://link.saintkappa.dev/icon.png" height="24">

### Snip your long URLs in the snap of a finger! https://link.saintkappa.dev

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

```
Content-Type: application/json;
```

#### Request body (JSON):

```js
{ "url": "example.com" }
// Note: if you don't provide a url protocol, your snip will default to https
```

#### Example response:

```json
{
    "snipId": "DjX",
    "snipUrl": "https://link.saintkappa.dev/DjX",
    "redirectUrl": "https://github.com/theSaintKappa",
    "createdAt": "2023-08-24T22:24:59.096Z",
    "alreadyExisted": true
}
```

#### Example request:

```bash
$ curl --request POST \
    https://link.saintkappa.dev/api/new \
    --header 'Content-Type: application/json' \
    --data '{ "url": "https://github.com/theSaintKappa" }'
```
