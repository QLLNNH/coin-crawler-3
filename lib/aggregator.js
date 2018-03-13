'use strict';
const log = require('./log');
const cache = require('./cache');
const okex_handler = require('./okex_handler_2');

class Aggregator {

    constructor(ss) {
        this.ss = ss;
        this.sockets = new Map();
        this.symbols = okex_handler.fetch_symbols();
        this.init_ws_server();
        this.fetch_okex_future_kline();
    }

    async fetch_okex_future_kline() {
        try {
            console.time('全部任务耗时');
            const kline_results = await okex_handler.symbols_to_kline(this.symbols, 30)
            cache.set_cache(5, kline_results['05']);
            cache.set_cache(10, kline_results['10']);
            cache.set_cache(15, kline_results['15']);
            cache.set_cache(30, kline_results['30']);
            for (let socket of this.sockets.values()) socket.emit('change');
            console.timeEnd('全部任务耗时');
        }
        catch (err) {
            log.info({ lv: 'ERROR', message: err.message, desc: 'fetch_okex_future_kline error' });
        }
        finally {
            this.timer = setTimeout(this.fetch_okex_future_kline.bind(this), 5 * 1000);
        }
    }

    init_ws_server() {
        this.ss.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);
            for (let socket of this.sockets.values()) socket.emit('online', this.sockets.size);

            socket.emit('symbols', this.symbols);

            socket.on('disconnect', () => {
                this.sockets.delete(socket.id);
                for (let socket of this.sockets.values()) socket.emit('online', this.sockets.size);
            });

            socket.on('kline', (interval) => socket.emit('kline', cache.get_cache(interval)));
        });
    }
}

module.exports = Aggregator;