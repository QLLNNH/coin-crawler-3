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
    // TODO
    // return 6.31;
    return ret.rate;
}

exports.symbols_to_kline = async (symbols, interval) => {
    const size = Math.floor(interval / 1);
    const fail_symbols = [];
    const symbols_kline_5 = [];
    const symbols_kline_10 = [];
    const symbols_kline_15 = [];
    const symbols_kline_30 = [];

    // 循环处理交易对
    for (let symbol of symbols) {
        try {
            const future_index = await fetch_future_index(symbol);
            const statistics_5 = new Array(8);
            const statistics_10 = new Array(8);
            const statistics_15 = new Array(8);
            const statistics_30 = new Array(8);

            {
                statistics_5[0] = symbol;
                statistics_10[0] = symbol;
                statistics_15[0] = symbol;
                statistics_30[0] = symbol;

                statistics_5[1] = future_index;
                statistics_10[1] = future_index;
                statistics_15[1] = future_index;
                statistics_30[1] = future_index;
            }

            // 循环处理该交易对在不同时期的合约
            for (let task of yield_opt(symbol, size)) {

                let total_5 = 0;
                let total_10 = 0;
                let total_15 = 0;
                let total_30 = 0;
                let latest_price = 0;

                // 获取该交易对在该平台的价格
                const kline_result = await request.send(task);

                // 如果有返回结果
                if (kline_result.length) {
                    kline_result.forEach((datum, index) => {
                        if (index >= 25) total_5 += datum[5];
                        if (index >= 20) total_10 += datum[5];
                        if (index >= 15) total_15 += datum[5];
                        total_30 += datum[5];
                        latest_price = datum[4];
                    });
                }

                let index;
                if (task.qs.contract_type === 'this_week') index = 2;
                else if (task.qs.contract_type === 'next_week') index = 4;
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

            log.info(statistics_5.join(', '));
            log.info(statistics_10.join(', '));
            log.info(statistics_15.join(', '));
            log.info(statistics_30.join(', '));
        }
        catch (err) {
            fail_symbols.push(symbol);
            log.info({ lv: 'ERROR', message: err.message, desc: symbol });
        }
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

async function fetch_future_index(symbol) {
    const ret = await request.send({
        host: 'www.okex.com'
        , path: '/api/v1/future_index.do'
        , qs: { symbol: symbol }
    });
    // TODO
    // return 413.5;
    return ret.future_index;
}
