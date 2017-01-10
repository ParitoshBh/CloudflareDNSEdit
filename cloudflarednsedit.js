const zones = require('./helper/cloudflare/zones');
const dns = require('./helper/cloudflare/dns');
const updater = require('./helper/cloudflare/updatedns');
const wanip = require('./helper/waniplocator');
const log = require('./helper/logging');
const mailgun = require('./helper/mailer/mailgun');

function startUpdater(userDetails) {
    // Check if we need to get the zone id or there's one given by user
    if (userDetails.zoneId === '') {
        log.dump('Fetching Zone ID');
        // Fetch the zone id first
        zones.fetchID(userDetails).then(function(response) {
            log.dump('Zone ID retrieved: ' + response.id);
            userDetails.zoneId = response.id;
            // Fetch dns record with retrieved zone id
            fetchDNSRecord(userDetails);
        }, function(errorData) {
            // Log the error message
            log.dump('Unable to fetch Zone ID. Exiting.');
        });
    } else {
        log.dump('Using the Zone ID provided by the user.');
        // We'll use the zone id given by user
        // console.log('Using Zone Id given by the user:', config.zoneId);
        // Fetch dns record with retrieved zone id
        fetchDNSRecord(userDetails);
    }
}

function fetchDNSRecord(userDetails) {
    log.dump('Attempting to retrieve Domain DNS record');
    dns.fetchDomainDNSRecord(userDetails).then(function(zoneDetails) {
        log.dump('Domain DNS record retrieved');
        // Check if dns record content (ip address) is given by user
        if (userDetails.content === '') {
            log.dump('Attempting to retrieve current WAN IP of user');
            // No ip address given by user. Get one
            //TODO Handle rejection possibility
            wanip.locator().then(function(ipAddress) {
                log.dump('WAN IP address retrieved: ' + ipAddress);
                // console.log('Using extracted IP address:', ipAddress);
                //userDetails.content = ipAddress;
                log.dump('Checking if IP address is already up-to date');
                // Check if there's a need to update DNS or it is already in Sync
                if (isDNSMatching(zoneDetails.content, String(ipAddress))) {
                    // Skip DNS editing, since it is already up to date
                    log.dump('DNS is already in sync. Skipping DNS update.');
                } else {
                    // There's a discrepency, update the DNS record
                    updateDNSRecord(userDetails, zoneDetails, ipAddress);
                }
            });
        } else {
            log.dump('Using the WAN IP address provided by the user');
            log.dump('Checking if IP address is already up-to date');
            // We already have the ip address, we'll continue with updating dns
            // Check if there's a need to update DNS or it is already in Sync
            if (isDNSMatching(zoneDetails.content, userDetails.content)) {
                // Skip DNS editing, since it is already up to date
                log.dump('DNS is already in sync. Skipping DNS update.');
            } else {
                // There's a discrepency, update the DNS record
                updateDNSRecord(userDetails, zoneDetails, userDetails.content);
            }
        }
    }, function(errorData) {
        // Log error message
        log.dump('Could not retrieve Domain DNS record. Exiting.');
    });
}

function updateDNSRecord(userDetails, zoneDetails) {
    log.dump('Attempting to edit DNS record with new one');
    updater.editDNS(userDetails, zoneDetails).then(function(editDNSResponse) {
        // Log successful DNS update details
        log.dump('DNS updated successfully to ' + editDNSResponse.content + ' for ' + editDNSResponse.name);
        // Send an email notification, if enabled
        if (userDetails.emailNotification) {
            // Send an email with data from Cloudflare response
            mailgun.sendEmail(userDetails.mailgun, 'success', editDNSResponse);
        }
    }, function(errorData) {
        // Log error message
        log.dump('Unable to update DNS. Encountered following error');
        // Send an email notification, if enabled
        if (userDetails.emailNotification) {
            // Send an email with data from Cloudflare response
            mailgun.sendEmail(userDetails.mailgun, 'error', errorData);
        }
    });
}

function isDNSMatching(cloudflareIP, userIP) {
    if (cloudflareIP == userIP) {
        return true;
    } else {
        return false;
    }
}

module.exports.startMonitoring = function(userDetails) {
    var updateInterval = userDetails.updateInterval;

    // Attempt to run updater at each user defined interval
    setInterval(function() {
        log.dump('Attempting to update Cloudflare DNS');
        startUpdater(userDetails);
    }, updateInterval);
}
