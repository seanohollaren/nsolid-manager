# N|Solid Manager

#### A manager to help wrangle the various moving parts of N|Solid

This code is meant to automatically set up and tear down the prerequisites required for an N|Solid server and execute a target app using the `nsolid` executable.

## Set up

1. Place the contents of the N|Solid proxy/hub folder inside the `nsolid/proxy` folder.

2. Place the contents of the N|Solid console folder inside the `nsolid/console` folder.

3. Ensure you have `etcd` installed (and in the system path) as you normally would to run N|Solid.


## Running an app

Once you've placed the console and proxy files in the expected folders, you're ready to run the app.

Navigate to the nsolid-manager root directory and call an app like this:

```
node index --name myApp --path [path to target app]
```

## Parameters

#### name
The user-friendly name for your app.  This is how it will be displayed in the N|Solid console.

#### path
The path to the target app's node entry point.

## Default behavior

The manager doesn't offer much customization right now.  It's using the default ports and addresses for the various moving parts of N|Solid.

Tweak the `.nsolid-proxyrc` file to adjust proxy settings.

The manager will automatically set the following environment variables as part of start-up:
```
NSOLID_HUB = 'localhost:4001'
NSOLID_SOCKET = 1111
```

## Coming soon

1. nsolid-manager should be able to be installed globally as an npm module, so you don't need to be inside the project folder to call it.

2. The manager should offer more optional parameters to override default behavioro such as the port on which to host the N|Solid console.
