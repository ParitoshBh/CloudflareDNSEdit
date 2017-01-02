const path = require('path');
const fs = require('fs');

module.exports.dump = function(logMessage) {
    const logFile = path.join(path.dirname(__dirname), 'log.txt');

    var currentDate = new Date().toLocaleString();

    // Append current date, time and a new line to log message
    logMessage = currentDate + ':\t\t' + logMessage + '\n';

    // Open the success log file for writing (in append mode)
    //fs.open(path, flags[, mode], callback)
    fs.open(logFile, 'a', function(error, fd) {
        // If there is an error, simply console the message
        if (error) {
            console.error('Unable to write to log file');
        } else {
            // Attempt to write the log
            //fs.write(fd, data[, position[, encoding]], callback)
            fs.write(fd, logMessage, 0, 'utf-8', function(err, written, string) {
                // Check for error
                if (err) {
                    // Silently console the error message
                    console.error(err);
                } else {
                    // Close the file
                    //fs.close(fd, callback)
                    fs.close(fd, function() {
                        // console.log('Success log file closed');
                    });
                }
            });
        }
    });
}
