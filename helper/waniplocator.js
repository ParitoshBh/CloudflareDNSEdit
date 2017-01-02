var http = require('http');

module.exports.locator = function() {
    return new Promise(function(resolve, reject) {
        http.get({
            'host': 'api.ipify.org',
            'port': 80,
            'path': '/'
        }, function(resp) {
            resp.on('data', function(ip) {
                ip = ip.toString();
                resolve(ip);
            });
        });
    });
};
