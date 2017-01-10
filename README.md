CloudflareDNSEdit is a simple DNS editor for Cloudflare minus all the frills. It was written for keeping my home server's ip address in sync with Cloudflare and uses API v4.

I wasn't too keen on using DDclient (neither it worked for me) and my DD-WRT running linksys router did not support Cloudflare out of the box. Hence CloudflareDNSEdit!

# What It Can Do
Note that this module has a limited use case and that is for updating (not adding) DNS of an <b>existing</b> (A) record of a (parent) domain/sub-domain. Additionally, since I did not want to log into server occasionally to see the status, I added mailgun support for sending out email notifications in case of update success/failure.

# Getting Started
Before getting the module from npm, we need to do a couple of things,

1. Make sure that Node.js (and npm) is installed on your server. I have tested this module on Node.js version 6.9.2.

1. Since the module will be running continually, get a reliable process manager i.e. pm2 (in this case). A simple `npm install pm2 -g` would suffice.

P.S - If you are having trouble running pm2 and are seeing error message */usr/bin/env: ‘node’: No such file or directory*, then its quite possible that you've got the legacy version of Node.js. [This thread](https://github.com/Unitech/pm2/issues/455) might be of some help.

Now that we've the basic setup,

1. Make a new directory `mkdir dnsupdater`

1. cd into the newly created directory

1. Get the module from npm using `npm install cloudflarednsedit --save`

1. Create an `entry.js` file (sample entry.js file is shared below)

1. Lastly start the entry.js with pm2 `pm2 start entry.js pm2 start app.js --name="Cloudflare Updater"`


```
const cloudflarednsedit = require('cloudflarednsedit');

// Preferences and Cloudflare account details
var userDetails = {
    // Email address associated with Cloudflare account
    "email": "<YOUR_CLOUDFLARE_EMAIL_ADDRESS>",

    // Authentication key allocated to your account
    "authKey": "<YOUR_GLOBAL_AUTHENTICATION_KEY>",

    // Domain name for which DNS record needs to be updated
    "domainName": "<YOUR_DOMAIN_NAME>",

    // DNS record type
    // valid values: A, AAAA, CNAME, TXT, SRV, LOC, MX, NS, SPF
    "type": "A",

    // Time to live for DNS record. Value of 1 is 'automatic'
    "ttl": 1,

    // Whether the record is receiving the performance and security benefits of Cloudflare
    // true -> Yes, false -> No
    "proxied": true,

    // Zone id
    // Enter if you have the zone and are sure about its correctness.
    // Otherwise leave it blank. DNSUpdater will get it for you!
    "zoneId": "",

    // DNS record content
    // Eg. "123.456.789.10"
    // Leave it blank to fetch the WAN IP automatically
    "content": "",

    // Update interval (in milliseconds)
    // 1000 milliseconds = 1 second
    // 1 minute = 60000 seconds
    // 1 day = 86400000 seconds
    // Note: When interval is larger than 2147483647 or less than 1, the delay will be set to 1
    "updateInterval": 10000,

    // Optional configurations for Mailgun email notifications
    // true -> email notifications will be sent using mailgun credentials below
    // false -> no email notifications will be sent
    "emailNotification": false,

    "mailgun": {
        "apiKey": "<YOUR_MAILGUN_API_KEY>",
        "domain": "<YOUR_DOMAIN_NAME>",
        "from": "<SOME_NAME> <EMAIL_ADDRESS(IN ANGULAR BRACKETS)>",
        "to": "<EMAIL_ADDRESS>",
        "subject": "<SOME_SUBJECT_LINE>"
    }
};

// Start monitoring (and updating DNS as and when required!)
cloudflarednsedit.startMonitoring(userDetails);
```
# Be Careful
The module (tries) to log everything it does in a log.txt file (at the same directory from which you start entry.js file) and thus you'll have a fairly good idea of what happened since you last logged in. Therefore, the log.txt file can get pretty huge pretty fast (depending on update interval).

Since I am in the habit of updating servers once a fortnight, I usually scan through the logs and clear them out. But if you aren't one of those guys, raise and issue here and I'll try to post a workaround.

Additionally, you might also encounter [object] notations in log file. Those are error/response dumps (without string conversions). I'll try to get rid of those soon!

Lastly, if you have a long list of records, probably this module will not work since it currently checks for only the first page records sent by Cloudflare API. It will just silently fail to update any DNS entry. However, usually for most of you this shouldn't be a problem.

# Contribution
The module hasn't been thoroughly tested and thus susceptible to errors, crashes, etc. I wrote it for my personal server so as to be worried about one less thing.

It would be great if people can chip and report errors, crashes, etc. with appropriate data and raise an issue.

# Credits
The module uses [Ipify API](https://www.ipify.org/) for getting the WAN IP of server. So don't forget to treat them (and me ;)) if you find this module saving some time for yourself!
