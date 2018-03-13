'use strict';
const https = require('https');
const querystring = require('querystring');
const agent = new https.Agent({ keepAlive: true, maxSockets: 30 });
const timeout = 10 * 1000;

exports.send = (opt) => {
    return new Promise((fulfill, reject) => {
        // return fulfill({ future_index: 432.15 });

        const request = https.get({
            host: opt.host
            , path: `${opt.path}?${querystring.stringify(opt.qs)}`
            , agent: agent
        });

        request.setTimeout(timeout, () => {
            request.abort();
            return reject({
                lv: 'ERROR'
                , message: 'http timeout'
                , result: { status: 801, description: 'http timeout', data: null }
            });
        });

        request.on('error', (err) => reject({
            lv: 'ERROR'
            , message: err.message || err
            , result: { status: 802, description: 'http error', data: null }
        }));

        request.on('response', (res) => {
            if (res.statusCode !== 200) return reject({
                lv: 'ERROR'
                , message: `http response ${res.statusCode}`
                , result: { status: 803, description: `http response ${res.statusCode}`, data: null }
            });

            let count = 0, chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
                count += chunk.length;
            });

            res.on('end', () => {
                try {
                    return fulfill(JSON.parse(Buffer.concat(chunks, count)));
                }
                catch (err) {
                    return reject({
                        lv: 'ERROR'
                        , message: 'http response format error'
                        , result: { status: 804, description: 'http result format error', data: null }
                    });
                }
            });
        });
    });
}

exports.send_2 = (opt) => {
    return new Promise((fulfill, reject) => {
        // return fulfill([
        //     [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        //     , [1520326200000, 7.896, 7.904, 7.891, 7.891, 9106, 11537.123636553612]
        // ]);

        const request = https.get({
            host: opt.host
            , path: `${opt.path}?${querystring.stringify(opt.qs)}`
            , agent: agent
        });

        request.setTimeout(timeout, () => {
            request.abort();
            return reject({
                lv: 'ERROR'
                , message: 'http timeout'
                , result: { status: 801, description: 'http timeout', data: null }
            });
        });

        request.on('error', (err) => reject({
            lv: 'ERROR'
            , message: err.message || err
            , result: { status: 802, description: 'http error', data: null }
        }));

        request.on('response', (res) => {
            if (res.statusCode !== 200) return reject({
                lv: 'ERROR'
                , message: `http response ${res.statusCode}`
                , result: { status: 803, description: `http response ${res.statusCode}`, data: null }
            });

            let count = 0, chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
                count += chunk.length;
            });

            res.on('end', () => {
                try {
                    return fulfill(JSON.parse(Buffer.concat(chunks, count)));
                }
                catch (err) {
                    return reject({
                        lv: 'ERROR'
                        , message: 'http response format error'
                        , result: { status: 804, description: 'http result format error', data: null }
                    });
                }
            });
        });
    });
}