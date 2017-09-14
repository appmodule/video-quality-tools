'use strict';

const FramesMonitor = require('./src/FramesMonitor');
const StreamsInfo   = require('./src/StreamsInfo');
const processFrames = require('./src/processFrames');

const Errors = require('./src/Errors');

module.exports = {
    FramesMonitor,
    StreamsInfo,
    processFrames,
    Errors
};
