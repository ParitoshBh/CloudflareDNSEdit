const https = require('https');

module.exports.editDNS = function(userDetails, zoneDetails, ipAddress) {
    return new Promise(function(resolve, reject) {
        // Prepare path for request based on zone id
        var zonePath = '/client/v4/zones/' + userDetails.zoneId + '/dns_records/' + zoneDetails.id;

        // Prepare header for request
        var options = {
            hostname: 'api.cloudflare.com',
            path: zonePath,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Key': userDetails.authKey,
                'X-Auth-Email': userDetails.email
            }
        };

        // Prepare data for request body
        var body = JSON.stringify({
            type: userDetails.type,
            name: userDetails.domainName,
            content: ipAddress,
            ttl: userDetails.ttl,
            proxied: userDetails.proxied
        });

        // Send request to cloudflare api
        var req = https.request(options, (res) => {
            // console.log('statusCode:', res.statusCode);

            var result = '';

            res.on('data', (d) => {
                // process.stdout.write(d);
                result += d;
            });

            res.on('end', function() {
                var jsonObj = JSON.parse(result);
                // Check if api response was successfull
                if (jsonObj.success) {
                    resolve(jsonObj.result);
                } else {
                    // return reject promise response
                    reject(jsonObj);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(body);

        req.end();

    });

}
