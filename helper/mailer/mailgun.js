const log = require('../logging');

module.exports.sendEmail = function(mailgunConfig, type, response) {
    var api_key = mailgunConfig.apiKey;
    var domain = mailgunConfig.domain;
    var mailgun = require('mailgun-js')({
        apiKey: api_key,
        domain: domain
    });

    var emailBody = '';

    if (type === 'success') {
        emailBody = 'DNS updated successfully to ' + response.content + ' for ' + response.name;
    } else {
        emailBody = 'Unable to update DNS. Encountered following error:\n\n' + response;
    }

    var data = {
        from: mailgunConfig.from,
        to: mailgunConfig.to,
        subject: mailgunConfig.subject,
        text: emailBody
    };

    mailgun.messages().send(data, function(error, body) {
        // Log any error message generated
        if (error) {
            log.dump(error);
        } else {
            log.dump('Email notification sent!');
        }
    });
};
