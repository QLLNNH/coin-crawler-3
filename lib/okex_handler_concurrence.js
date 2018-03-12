'use strict';
const log = require('./log');
const request = require('./request');

exports.fetch_symbols = () => {
    return ['btc_usd', 'ltc_usd', 'eth_usd', 'etc_usd', 'bch_usd', 'btg_usd', 'xrp_usd', 'eos_usd'];
}

exports.usd_to_rmb = async () => {
    const ret = await request.send({
        host: 'www.okex.com'
        , path: '/api/v1/exchange_rate.do'
    });
    return ret.rate;
}

exports.symbols_to_kline = async (symbols, interval) => {
    const size = Math.floor(interval / 1);

    const index_promises = symbols.map((symbol) => {
        return request.send({
            host: 'www.okex.com'
            , path: '/api/v1/future_index.do'
            , qs: { symbol: symbol }
        });
    });
    const index_rets = await Promise.all(index_promises);
    const future_indexes = index_rets.map((ret) => ret.future_index);

    console.log(`完成指数请求${future_indexes}次`);

    const kline_promises = [];
    symbols.forEach((symbol) => yield_opt(symbol, size).forEach((task) => kline_promises.push(request.send(task))));
    const kline_rets = await Promise.all(kline_promises);

    console.log(`完成合约请求${kline_rets}次`);

    const symbols_kline_5 = [];
    const symbols_kline_10 = [];
    const symbols_kline_15 = [];
    const symbols_kline_30 = [];

    for (let i = 0, len = kline_rets.length; i < len; i += 3) {

        const statistics_5 = new Array(8);
        const statistics_10 = new Array(8);
        const statistics_15 = new Array(8);
        const statistics_30 = new Array(8);

        const symbol_index = i / 3;

        statistics_5[0] = symbols[symbol_index];
        statistics_10[0] = symbols[symbol_index];
        statistics_15[0] = symbols[symbol_index];
        statistics_30[0] = symbols[symbol_index];

        statistics_5[1] = future_indexes[symbol_index];
        statistics_10[1] = future_indexes[symbol_index];
        statistics_15[1] = future_indexes[symbol_index];
        statistics_30[1] = future_indexes[symbol_index];

        for (let j of [0, 1, 2]) {
            let total_5 = 0;
            let total_10 = 0;
            let total_15 = 0;
            let total_30 = 0;
            let latest_price = 0;

            kline_rets[i + j].forEach((datum, k) => {
                if (k >= 25) total_5 += datum[5];
                if (k >= 20) total_10 += datum[5];
                if (k >= 15) total_15 += datum[5];
                total_30 += datum[5];
                latest_price = datum[4];
            });

            let index;
            if ((i + j) % 3 === 0) index = 2;
            else if ((i + j) % 3 === 1) index = 4;
            else index = 6;

            statistics_5[index] = latest_price;
            statistics_10[index] = latest_price;
            statistics_15[index] = latest_price;
            statistics_30[index] = latest_price;

            statistics_5[index + 1] = Number((total_5 / 1000).toFixed(1));
            statistics_10[index + 1] = Number((total_10 / 1000).toFixed(1));
            statistics_15[index + 1] = Number((total_15 / 1000).toFixed(1));
            statistics_30[index + 1] = Number((total_30 / 1000).toFixed(1));
        }

        symbols_kline_5.push(statistics_5);
        symbols_kline_10.push(statistics_10);
        symbols_kline_15.push(statistics_15);
        symbols_kline_30.push(statistics_30);
    }

    return {
        '05': symbols_kline_5.sort((a, b) => b[4] - a[4])
        , '10': symbols_kline_10.sort((a, b) => b[4] - a[4])
        , '15': symbols_kline_15.sort((a, b) => b[4] - a[4])
        , '30': symbols_kline_30.sort((a, b) => b[4] - a[4])
    }
}

function yield_opt(symbol, size) {
    return ['this_week', 'next_week', 'quarter'].map((period) => {
        return {
            host: 'www.okex.com'
            , path: '/api/v1/future_kline.do'
            , qs: {
                type: '1min'
                , size: size
                , symbol: symbol
                , contract_type: period
            }
        }
    });
}