> **Note: This has been broken with the newest versions of N|Solid.  The good news is it's now much easier to set up than it used to be, so NSM is no longer needed.**

# N|Solid Manager

#### Automatically download and start up everything required to run N|Solid

## Installation

```bash
npm install -g nsolid-manager
```

## Usage

```bash
nsm app.js
```

This will spin up [N|Solid's](https://nodesource.com/products/nsolid) dependencies and start an N|Solid Console server on port 3000.

You can also specify a custom name for your application (reflected in the Console) with the --name flag:

```bash
nsm app.js --name myApp
```

## Features

Automatically download and set up all prerequisites required for an N|Solid server and execute a target app using the `nsolid` executable.

It'll handle:
- Downloading N|Solid and all required dependencies (N|Solid Runtime, N|Solid Hub/Proxy, N|Solid Console, etcd) for your platform
- Starting all necessary services
- Exporting relevant environment variables
- Starting the target app with the `nsolid` executable

With one command, you'll be ready to navigate to the N|Solid Console and watch how your app is doing.

## Parameters

#### --name or -n
(optional) A user-friendly name for your app.  This is how it will be displayed in the N|Solid console.

#### --path or -p
(optional) An alternative way to specify the target app's location.

## Default behavior

The manager doesn't offer much customization yet.  It's using the default ports and addresses for the different components of N|Solid.

Tweak the `.nsolid-proxyrc` file (inside the global module's `dependencies` folder) as you normally would to adjust proxy settings.

The manager will automatically set the following environment variables as part of start-up:
```
NSOLID_HUB = 'localhost:4001'
NSOLID_SOCKET = 1111
```

## Disclaimer

Currently, nsolid-manager only supports running one app at a time.  We're working on this.

## Bug reports and feature requests

Please feel free to submit an issue on the nsolid-manager [GitHub page](https://github.com/seanohollaren/nsolid-manager) if you come across any issues.

## Contribute

If you'd like contribute to nsolid-manager, [please do!](https://github.com/seanohollaren/nsolid-manager)

## Coming soon

- The manager should offer more optional parameters to override default behavior such as the port on which to host the N|Solid console.
