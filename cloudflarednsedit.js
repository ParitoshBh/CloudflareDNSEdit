const zones = require('./helper/cloudflare/zones');
const dns = require('./helper/cloudflare/dns');
const updater = require('./helper/cloudflare/updatedns');
const wanip = require('./helper/waniplocator');
const log = require('./helper/logging');
const mailgun = require('./helper/mailer/mailgun');

function startUpdater(userDetails) {
    // Check if we need to get the zone id or there's one given by user
    if (userDetails.zoneId === '') {
        // Fetch the zone id first
        zones.fetchID(userDetails).then(function(response) {
            userDetails.zoneId = response.id;
            // Fetch dns record with retrieved zone id
            fetchDNSRecord(userDetails);
        }, function(errorData) {
            // Log the error message
            log.dump(errorData);
        });
    } else {
        // We'll use the zone id given by user
        // console.log('Using Zone Id given by the user:', config.zoneId);
        // Fetch dns record with retrieved zone id
        fetchDNSRecord(userDetails);
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
                if (isDNSMatching(zoneDetails.content, String(ipAddress))) {
                    // Skip DNS editing, since it is already up to date
                    log.dump('DNS is already in sync. Skipping DNS update.');
                } else {
                    // There's a discrepency, update the DNS record
                    updateDNSRecord(userDetails, zoneDetails);
                }
            });
        } else {
            // We already have the ip address, we'll continue with updating dns
            // Check if there's a need to update DNS or it is already in Sync
            if (isDNSMatching(zoneDetails.content, String(userDetails.content))) {
                // Skip DNS editing, since it is already up to date
                log.dump('DNS is already in sync. Skipping DNS update.');
            } else {
                // There's a discrepency, update the DNS record
                updateDNSRecord(userDetails, zoneDetails);
            }
        }
    }, function(errorData) {
        // Log error message
        log.dump(errorData);
    });
}

function updateDNSRecord(userDetails, zoneDetails) {
    updater.editDNS(userDetails, zoneDetails).then(function(editDNSResponse) {
        // Log successful DNS update details
        log.dump('DNS updated successfully to ' + editDNSResponse.content + ' for ' + editDNSResponse.name);
        // Send an email notification, if enabled
        if (userDetails.emailNotification) {
            log.dump('Sending email notification');
            // Send an email with data from Cloudflare response
            mailgun.sendEmail(userDetails.mailgun, 'success', editDNSResponse);
        }
    }, function(errorData) {
        // Log error message
        log.dump('Unable to update DNS. Encountered following error:\n\n' + errorData);
        // Send an email notification, if enabled
        if (userDetails.emailNotification) {
            log.dump('Sending email notification');
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
