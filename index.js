var zlib = require('zlib');
var AWS = require('aws-sdk');
var url = require('url');
var https = require('https');
var _ = require('lodash');

var baseSlackMessage = {}

var postMessage = function(message, callback) {
  var body = JSON.stringify(message);
  var options = url.parse(process.env.UNENCRYPTED_HOOK_URL);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };

  var postReq = https.request(options, function(res) {
    var chunks = [];
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      return chunks.push(chunk);
    });
    res.on('end', function() {
      var body = chunks.join('');
      if (callback) {
        callback({
          body: body,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage
        });
      }
    });
    return res;
  });

  postReq.write(body);
  postReq.end();
};

var matchesIgnorePattern = function(message) {
  return message.indexOf("VM returned with error") > -1;
}

var isRestart = function(message) {
  return message.indexOf("Waiting for Postgres server") > -1 || message.indexOf("Starting Geth...") > -1;
}

var handleCloudWatch = function(log, context) {
  var timestamp = log.logEvents[0].timestamp;
  var message = log.logEvents[0].message;
  var logGroupAndStream = `Group: \`${log.logGroup}\`, Stream: \`${log.logStream}\``
  var color = "danger";

  if (matchesIgnorePattern(message)) {
    return undefined;
  }

  let title
  if (isRestart(message)) {
    header = "Process restart"
    title = "Log level"
  } else {
    header = "ERROR"
    title = "Error in Logs"
  }

  let timestampUTCString = new Date(timestamp).toISOString()
  let link = `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?region=${process.env.AWS_REGION}#logEventViewer:group=${log.logGroup};stream=${log.logStream};start=${timestampUTCString}`

  var slackMessage = {
    text: `*${header}*`,
    attachments: [
      {
        "color": color,
        "fields": [
          { "title": title, "value": logGroupAndStream, "short": false},
          { "title": "Message", "value": message, "short": false },
          { "title": "Link to logs", "value": link, "short": true}
        ],
        "ts":  timestamp
      }
    ]
  };
  return _.merge(slackMessage, baseSlackMessage);
};

exports.handler = function(event, context) {
  const payload = Buffer.from(event.awslogs.data, 'base64');
  const log = JSON.parse(zlib.gunzipSync(payload).toString('utf8'));

  console.log("log received:" + JSON.stringify(log, null, 2));
  var slackMessage = null;

  slackMessage = handleCloudWatch(log, context);

  if (!slackMessage) {
    context.succeed();
    return;
  }

  postMessage(slackMessage, function(response) {
    if (response.statusCode < 400) {
      console.info('message posted successfully');
      context.succeed();
    } else if (response.statusCode < 500) {
      console.error("error posting message to slack API: " + response.statusCode + " - " + response.statusMessage);
      // Don't retry because the error is due to a problem with the request
      context.succeed();
    } else {
      // Let Lambda retry
      context.fail("server error when processing message: " + response.statusCode + " - " + response.statusMessage);
    }
  });
};

