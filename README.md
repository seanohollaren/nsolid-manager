# N|Solid Manager

#### A manager to help wrangle the various moving parts of N|Solid

This code is meant to automatically set up and tear down the prerequisites required for an N|Solid server and execute a target app using the `nsolid` executable.

It'll handle:
- Starting the etcd service registry
- Starting the N|Solid Hub/Proxy service
- Starting the N|Solid Console server
- Exporting required environment variables
- Starting the target app with `nsolid`

With one command, you'll be ready to navigate to the N|Solid Console and watch how your app is doing.

## Set up

> **Note:** nsolid-manager currently requires Node 4 or higher

1. Place the contents of the N|Solid Hub/Proxy folder (downloaded from the [NodeSource site](https://downloads.nodesource.com/)) inside the `nsolid/proxy` folder.

2. Place the contents of the N|Solid Console folder (downloaded from the [NodeSource site](https://downloads.nodesource.com/)) inside the `nsolid/console` folder.

3. Ensure you have `etcd` installed (and in the system path) as you normally would to run N|Solid.


## Running an app

Once you've placed the console and proxy files in the expected folders, you're ready to run the app.

Navigate to the nsolid-manager root directory and call an app like this:

```
./bin/nsolid-manager.js --name myApp --path [path to target app]
```

## Parameters

#### name
The user-friendly name for your app.  This is how it will be displayed in the N|Solid console.

#### path
The path to the target app's node entry point.

## Default behavior

The manager doesn't offer much customization right now.  It's using the default ports and addresses for the different components of N|Solid.

Tweak the `.nsolid-proxyrc` file as you normally would to adjust proxy settings.

The manager will automatically set the following environment variables as part of start-up:
```
NSOLID_HUB = 'localhost:4001'
NSOLID_SOCKET = 1111
```

## Coming soon

1. nsolid-manager should be able to be installed globally as an npm module, so you don't need to be inside the project folder to call it.

2. The manager should offer more optional parameters to override default behavior such as the port on which to host the N|Solid console.

3. The manager should have a better way of handling how it finds the Proxy and Console code.  It should be able to be pointed to their location on the file system or handle pulling down its own copy.
