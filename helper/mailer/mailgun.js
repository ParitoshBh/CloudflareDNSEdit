const log = require('../logging');

module.exports.sendEmail = function(mailgunConfig, type, response) {
    // Log the action
    log.dump('Sending email notification');

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
        emailBody = 'Unable to update DNS. Encountered an error. Please refer server logs for more information.';
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
            log.dump('Unable send email notification.');
        } else {
            log.dump('Email notification sent!');
        }
    });
};
