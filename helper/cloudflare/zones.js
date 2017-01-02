const https = require('https');

// Get zone id for given domain name
function getZoneId(zones, domainName) {
    // Fetch domain name id from zones
    for (var i = 0; i < zones.length; i++) {
        if (zones[i].name === domainName) {
            // console.log('Identified ' + domainName + ' as parent domain name');
            // console.log('Id:', zones[i].id);
            return {
                id: zones[i].id,
                isSubdomain: 'false'
            };
        } else if (domainName.includes(zones[i].name)) {
            // console.log('Identified ' + domainName + ' as sub domain name');
            // console.log('Parent domain ' + zones[i].name + ' Id: ' + zones[i].id);
            return {
                id: zones[i].id,
                isSubdomain: 'true'
            };
        }
    }
}

// Get all zones for specified user account
module.exports.fetchID = function(userDetails) {
    return new Promise(function(resolve, reject) {
        // Prepare request options for given email, key combination
        var options = {
            hostname: 'api.cloudflare.com',
            path: '/client/v4/zones',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Key': userDetails.authKey,
                'X-Auth-Email': userDetails.email
            }
        };

        // Send the request
        var req = https.request(options, function(res) {

            // Check if request was successull
            if (res.statusCode === 200) {
                // Collect zone results
                var zoneResult = '';

                res.on('data', function(data) {
                    // Keep on adding the stream
                    zoneResult += data;
                });

                res.on('end', function() {
                    // Conver the stream to JSON object
                    var jsonObj = JSON.parse(zoneResult);
                    // Check if request was a success from Cloudflare
                    if (jsonObj.success) {
                        // Start by getting the zone id of user domain name
                        //TODO Ignoring the pagination. Only first page results are being looked at
                        var zoneDetails = getZoneId(jsonObj.result, userDetails.domainName);
                        //console.log(zoneDetails);
                        resolve(zoneDetails);
                    } else {
                        // Reject the promise returning entire response object
                        reject(jsonObj);
                    }
                });
            } else {
                // Reject the promise returning entire response object
                reject(res);
            }

        });

        // Log any error generated
        req.on('error', function(error) {
            // Reject the promise returning entire response object
            reject(error);
        });

        // Finish the request gracefully
        req.end();

    });

}
