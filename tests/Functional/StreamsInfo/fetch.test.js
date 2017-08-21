'use strict';

const path    = require('path');
const {spawn} = require('child_process');

const {assert} = require('chai');

const getPort = require('get-port');

const StreamsInfo = require('src/StreamsInfo');

const {StreamsInfoError} = require('src/Errors');

assert(process.env.FFPROBE, 'Specify path for ffprobe via FFPROBE env var');
assert(process.env.FFMPEG, 'Specify path for ffmpeg via FFMPEG env var');

const {FFPROBE, FFMPEG} = process.env;
const testFile          = path.join(__dirname, '../../inputs/test_IPPPP.mp4');

describe('StreamsInfo::fetch, fetch streams info from inactive stream', () => {

    let streamUrl;
    let streamsInfo;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        streamsInfo = new StreamsInfo({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);
    });

    it('fetch streams info from inactive stream', async function () {
        this.timeout(5 * 1000);

        try {
            await streamsInfo.fetch();

            assert.fail('fetch method must throw an error, why are you still here ?');
        } catch (err) {
            assert.instanceOf(err, StreamsInfoError);

            assert(err.message);
        }
    });

});

describe('StreamsInfo::fetch, fetch streams info from active stream', () => {

    let streamUrl;
    let streamsInfo;
    let ffmpeg;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        streamsInfo = new StreamsInfo({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);

        let command = `${FFMPEG} -re -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' ');

        ffmpeg = spawn(command[0], command.slice(1));
    });

    after(() => {
        ffmpeg.kill('SIGKILL');
    });

    it('fetch streams info from active stream', function (done) {
        this.timeout(5 * 1000);

        // we listen stderr cuz we rely on stderr banner output
        ffmpeg.stderr.once('data', async () => {
            const info = await streamsInfo.fetch();

            assert.isObject(info);

            assert.isNotEmpty(info.videos);
            assert.isNotEmpty(info.audios);

            done();
        });
    });

});
