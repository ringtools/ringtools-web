# Satoshi Radio RoF RingTools for web

Based on functionality of [StijnBTC/Ringtools](https://github.com/StijnBTC/Ringtools)<br>
Depends on [custom LND REST server](https://github.com/dsbaars/srrof-lnd-rest)

## Built with

Angular 12.2.10
vis.js and [ngx-vis](https://github.com/visjs/ngx-vis) modified to work with Angular 12
SVG graphics

## Usage

1. Install dependencies with `yarn install`
2. Make sure custom [custom LND REST server](https://github.com/dsbaars/srrof-lnd-rest) is running
3. Start development server with `yarn start`
4. Navigate to `http://localhost:4200/`

Note: You currently need to add the list of pubkeys and usernames manually to `src/app/services/ring-data.service.ts`. <br>
The plan is to be able to import a csv from Cheesebot (`/groupnodes`) soon.<br>

The URL to the LND REST server is set in `src/app/services/ring-data.service.ts`.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


