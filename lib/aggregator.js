'use strict';
const log = require('./log');
const cache = require('./cache');
const okex_handler = require('./okex_handler');

class Aggregator {

    constructor(ss) {
        this.ss = ss;
        this.sockets = new Map();

        this.init_ws_server();
        this.fetch_okex_future_kline();
    }

    async fetch_okex_future_kline() {
        try {
            console.time('tasks');
            const symbols = await okex_handler.fetch_symbols()
            const kline_results = await okex_handler.symbols_to_kline(symbols, 30)
            cache.set_cache(5, kline_results['05']);
            cache.set_cache(10, kline_results['10']);
            cache.set_cache(15, kline_results['15']);
            cache.set_cache(30, kline_results['30']);
            for (let socket of this.sockets.values()) socket.emit('change');
            console.timeEnd('tasks');
        }
        catch (err) {
            log.info({ lv: 'ERROR', message: err.message, desc: 'fetch_zb_kline error' });
        }
        finally {
            this.timer = setTimeout(this.fetch_okex_future_kline.bind(this), 5 * 1000);
        }
    }

    init_ws_server() {
        this.ss.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);

            socket.on('disconnect', () => this.sockets.delete(socket.id));

            socket.on('kline', (interval) => socket.emit('kline', cache.get_cache(interval)));
        });
    }
}

module.exports = Aggregator;