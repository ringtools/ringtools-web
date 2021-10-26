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

## Required modification of `lnd.conf` when using Umbrel

When using Umbrel, LND is configured to only accept connections of other dockerized applications. This is very secure, but makes it impossible to connect to outside of the Umbrel docker network.

To use this web-application using [dsbaars/srrof-lnd-pubsub-python](https://github.com/dsbaars/srrof-lnd-pubsub-python) you need to reconfigure your LND instance so it will accept connections from your LAN. Alternatively you could add the [LND PubSub Server](https://github.com/dsbaars/srrof-lnd-pubsub-python) to the existing Umbrel network but that is likely to break when you are updating Umbrel.

**Warning**: Although in my opinion this is a safe modification, do not trust me blindly. Please understand the basics of what the effects of this modification are. Proceed at your own risk.

The [LND gRPC API Reference](https://api.lightning.community/#lnd-grpc-api-reference) and the [Imports and Client section of the Python information](https://github.com/lightningnetwork/lnd/blob/master/docs/grpc/python.md#imports-and-client) should help you understand.

> At the time of writing this documentation, two things are needed in order to make a gRPC request to an lnd instance: a TLS/SSL connection and a macaroon used for RPC authentication. 

> Note that when an IP address is used to connect to the node (e.g. 192.168.1.21 instead of localhost) you need to add `--tlsextraip=192.168.1.21` to your `lnd` configuration and re-generate the certificate (delete tls.cert and tls.key and restart lnd).

What you are doing will regenerate your TLS certificates so it will include the IP-address and the hostname of your umbrel node.

**Important**: Although both the certificate and the private key are regenerated, you only need the certificate itself. If you are going to run the PubSub server externally, you only need to copy `tls.cert` and the `readonly.macaroon`. 

### Instructions

**Note**: You will have to restart LND to apply the changes.

1. Make a backup of your `lnd.conf`
- `cd ~/umbrel/lnd`
- `cp lnd.conf lnd.conf.bak`

2. Open the text editor (e.g. `nano ~/umbrel/lnd/lnd.conf` of your choice and add `tlsextraip=<your ip>` below the existing `tlsextraip=` line.

3. Just below the new entry, add another `tlsextradomain=` entry so it contains two entries in total:
````
tlsextradomain=umbrel.local
tlsextradomain=umbrel
````

4. Save and close the text editor

5. Restart lnd
- `cd ~/umbrel`
- `docker-compose restart lnd`

6. Wait until your node comes up again and that Umbrel still works, if not copy back the backpu config file and try again. 

You can verify that multiple `tlsextraip` and `tlsextradomain` are allowed at [Line 44 of the sample config](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf#L44).

Also you can read that `tlsautorefresh=1` automatically regenerates the necessary files, so although stated in their own guide, no deletion is required.
You might need to restart other Umbrel services since the TLS certificate is probably used by other Umbrel apps as well.

