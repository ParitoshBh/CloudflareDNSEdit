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
