var path = require('path');
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var fs = require('fs');
var moment = require('moment');
var scheduler = require('node-schedule');

var configFile = path.join(__dirname, 'configs.json');
if (!fs.existsSync(configFile)) {
    console.log('ERROR: no config file found!');
    return;
}
var cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));

var AipSpeech = require('./bd_api/index').speech;
var client = new AipSpeech(cfg.APP_ID, cfg.API_KEY, cfg.SECRET_KEY);

app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/tts', function(req, res) {
    console.log('GET TTS:' + req.query.t);
    client.text2audio(req.query.t, { per: 0 }).then(function(result) {
        console.log('TTS => ' + JSON.stringify(result.data).length);
        var fileName = moment().format('YYYYMMDD_HHmmss') + '.mp3';
        fs.writeFileSync(path.join(__dirname, 'public/tmp', fileName), result.data);
        fs.appendFileSync(path.join(__dirname, 'public/tmp/logs/generated.log'),
            fileName + ':' + req.query.t + '\n');
        res.send(fileName);
    });
});

scheduler.scheduleJob('DeleteTmpFileEveryNight', '0 0 0 * * *', function() {
    var tmpDir = path.join(__dirname, 'public/tmp');
    fs.readdir(tmpDir, function(err, files) {
        if (err) console.log(err);
        files.forEach(function(f) {
            if (path.extname(f) === '.mp3')
                fs.unlinkSync(path.join(tmpDir, f));
        });
        fs.appendFileSync(path.join(__dirname, 'public/tmp/logs/cleanup.log',
            moment.format('YYYY MM DD HH:mm:ss') + ': [' + files.length + '] mp3 files deleted.'));
    });
});

server.listen(4000);