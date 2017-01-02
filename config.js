// MODIFY YOUR ACCOUNT REALTED VALUES BELOW
/*********************************************************/

// Email address associated with Cloudflare account
const email = '';

// Authentication key allocated to your account
const authKey = '';

// Domain name for which DNS record needs to be updated
const domainName = '';

// DNS record type
// valid values: A, AAAA, CNAME, TXT, SRV, LOC, MX, NS, SPF
const type = 'A';

// Time to live for DNS record. Value of 1 is 'automatic'
const ttl = 1;

// Whether the record is receiving the performance and security benefits of Cloudflare
// true -> Yes, false -> No
const proxied = true;

// Zone id
// Enter if you have the zone and are sure about its correctness.
// Otherwise leave it blank. DNSUpdater will get it for you!
var zoneId = '';

// DNS record content
// Eg. "123.456.789.10"
var content = ''; // Leave it blank to fetch the WAN IP automatically

// Update interval (in milliseconds)
// 1000 milliseconds = 1 second
// 1 minute = 60000 seconds
// 1 day = 86400000 seconds
// Note: When interval is larger than 2147483647 or less than 1, the delay will be set to 1
const updateInterval = 60000;

// DO NOT MODIFY ANYTHING BELOW THIS LINE
/*********************************************************/

module.exports.email = email;
module.exports.authKey = authKey;
module.exports.domainName = domainName;
module.exports.zoneId = zoneId;
module.exports.type = type;
module.exports.content = content;
module.exports.ttl = ttl;
module.exports.proxied = proxied;
module.exports.updateInterval = updateInterval;
