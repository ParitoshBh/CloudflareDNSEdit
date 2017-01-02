const zones = require('./helper/cloudflare/zones');
const dns = require('./helper/cloudflare/dns');
const updater = require('./helper/cloudflare/updatedns');
const wanip = require('./helper/waniplocator');
const log = require('./helper/logging');
const config = require('./config');

var updateInterval = config.updateInterval;

// Attempt to run updater at each user defined interval
setInterval(function() {
    log.dump('Attempting to update Cloudflare DNS');
    startUpdater();
}, updateInterval);

function startUpdater() {
    // Check if we need to get the zone id or there's one given by user
    if (config.zoneId === '') {
        // Fetch the zone id first
        zones.fetchID(config).then(function(response) {
            config.zoneId = response.id;
            // Fetch dns record with retrieved zone id
            fetchDNSRecord(config);
        }, function(errorData) {
            // Log the error message
            log.dump(errorData);
        });
    } else {
        // We'll use the zone id given by user
        // console.log('Using Zone Id given by the user:', config.zoneId);
        // Fetch dns record with retrieved zone id
        fetchDNSRecord(config);
    }
}

function fetchDNSRecord(userDetails) {
    dns.fetchDomainDNSRecord(userDetails).then(function(zoneDetails) {
        // Check if dns record content (ip address) if given by user
        if (userDetails.content === '') {
            // No ip address given by user. Get one
            wanip.locator().then(function(ipAddress) {
                // console.log('Using extracted IP address:', ipAddress);
                userDetails.content = ipAddress;
                // Check if there's a need to update DNS or it is already in Sync
                if (zoneDetails.content === ipAddress) {
                    // Skip DNS editing, since it is already up to date
                    log.dump('DNS is already in sync. Skipping DNS update.');
                } else {
                    // There's a discrepency, update the DNS record
                    updateDNSRecord(userDetails, zoneDetails);
                }
            });
        } else {
            // We have ip address!
            // console.log('Using the IP address provided');
            // We already have the ip address, we'll continue with updating dns
            updateDNSRecord(userDetails, zoneDetails);
        }
    }, function(errorData) {
        // Log error message
        log.dump(errorData);
    });
}

function updateDNSRecord(updatedUserDetails, zoneDetails) {
    updater.editDNS(updatedUserDetails, zoneDetails).then(function(editDNSResponse) {
        // Log successful DNS update details
        log.dump(editDNSResponse);
    }, function(errorData) {
        // Log error message
        log.dump(errorData);
    });
}
