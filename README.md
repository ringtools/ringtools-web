# Satoshi Radio RoF RingTools for web

Based on functionality of [StijnBTC/Ringtools](https://github.com/StijnBTC/Ringtools)<br>
Depends on ~~[custom LND REST server](https://github.com/dsbaars/srrof-lnd-rest)~~  [custom LND PubSub server](https://github.com/dsbaars/srrof-lnd-pubsub-python)

## Built with

Angular 12.2.10
D3, SocketIO, vis.js and [ngx-vis](https://github.com/visjs/ngx-vis) modified to work with Angular 12
SVG graphics

## Usage

1. Install dependencies with `yarn install`
2. Configure settings by modifying `.env`
2. Make sure custom [custom LND PubSub server](https://github.com/dsbaars/srrof-lnd-pubsub-python) is running
3. Start development server with `yarn start`
4. Navigate to `http://localhost:4200/`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


