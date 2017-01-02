const https = require('https');

module.exports.fetchDomainDNSRecord = function(userDetails) {
    return new Promise(function(resolve, reject) {
        // Prepare path for request based on zone id
        var zonePath = '/client/v4/zones/' + userDetails.zoneId + '/dns_records';

        // Prepare header for request
        var options = {
            hostname: 'api.cloudflare.com',
            path: zonePath,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Key': userDetails.authKey,
                'X-Auth-Email': userDetails.email
            }
        };

        // Send request to cloudflare api
        var req = https.request(options, (res) => {
            // console.log('statusCode:', res.statusCode);

            var result = '';

            res.on('data', function(d) {
                result += d;
            });

            res.on('end', function() {
                var jsonObj = JSON.parse(result);
                // Check if api response was successfull
                if (jsonObj.success) {
                    // Loop through the records to fetch the one we need
                    for (var i = 0; i < jsonObj.result.length; i++) {
                        // Check for matching domain name
                        if (jsonObj.result[i].name === userDetails.domainName) {
                            resolve(jsonObj.result[i]);
                        }
                    }
                } else {
                    // return reject promise response
                    reject(jsonObj);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();

    });

}
