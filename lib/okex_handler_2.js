'use strict';
const log = require('./log');
const request = require('./request');

exports.fetch_symbols = () => {
    return ['btc_usd', 'ltc_usd', 'eth_usd', 'etc_usd', 'bch_usd', 'btg_usd', 'xrp_usd', 'eos_usd'];
}

exports.symbols_to_kline = async (symbols, interval) => {
    const size = Math.floor(interval / 1);
    const fail_symbols = [];
    const symbols_kline_5 = [];
    const symbols_kline_10 = [];
    const symbols_kline_15 = [];
    const symbols_kline_30 = [];

    const { rate } = await request.send({ host: 'www.okex.com', path: '/api/v1/exchange_rate.do' });

    const future_index_promises = symbols.map((symbol) => {
        return request.send({
            host: 'www.okex.com'
            , path: '/api/v1/future_index.do'
            , qs: { symbol: symbol }
        });
    });
    const future_index_rets = await Promise.all(future_index_promises);
    const future_indexes = future_index_rets.map((ret) => ret.future_index);

    for (let i = 0; i < symbols.length; i ++) {
        console.time(`${symbols[i]}`);
        try {
            const statistics_5 = new Array(11);
            const statistics_10 = new Array(11);
            const statistics_15 = new Array(11);
            const statistics_30 = new Array(11);

            {
                statistics_5[0] = symbols[i];
                statistics_10[0] = symbols[i];
                statistics_15[0] = symbols[i];
                statistics_30[0] = symbols[i];

                statistics_5[1] = future_indexes[i];
                statistics_10[1] = future_indexes[i];
                statistics_15[1] = future_indexes[i];
                statistics_30[1] = future_indexes[i];

                statistics_5[2] = Number((future_indexes[i] * rate).toFixed(2));
                statistics_10[2] = Number((future_indexes[i] * rate).toFixed(2));
                statistics_15[2] = Number((future_indexes[i] * rate).toFixed(2));
                statistics_30[2] = Number((future_indexes[i] * rate).toFixed(2));
            }

            const kline_promises = [];
            yield_opt(symbols[i], size).forEach((task) => kline_promises.push(request.send_2(task)));
            const kline_results = await Promise.all(kline_promises);

            kline_results.forEach((kline_result, j) => {
                let total_5 = 0;
                let total_10 = 0;
                let total_15 = 0;
                let total_30 = 0;
                let latest_price = 0;

                kline_result.forEach((datum, index) => {
                    if (index >= 25) total_5 += datum[5];
                    if (index >= 20) total_10 += datum[5];
                    if (index >= 15) total_15 += datum[5];
                    total_30 += datum[5];
                    latest_price = datum[4];
                });

                let index;
                if (j === 0) index = 3;
                else if (j === 1) index = 6;
                else index = 9;

                statistics_5[index] = latest_price;
                statistics_10[index] = latest_price;
                statistics_15[index] = latest_price;
                statistics_30[index] = latest_price;

                statistics_5[index + 1] = Number((latest_price * rate).toFixed(2));
                statistics_10[index + 1] = Number((latest_price * rate).toFixed(2));
                statistics_15[index + 1] = Number((latest_price * rate).toFixed(2));
                statistics_30[index + 1] = Number((latest_price * rate).toFixed(2));

                statistics_5[index + 2] = Number((total_5 / 1000).toFixed(2));
                statistics_10[index + 2] = Number((total_10 / 1000).toFixed(2));
                statistics_15[index + 2] = Number((total_15 / 1000).toFixed(2));
                statistics_30[index + 2] = Number((total_30 / 1000).toFixed(2));
            });

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
            fail_symbols.push(symbols[i]);
            log.info({ lv: 'ERROR', message: err.message, desc: symbols[i] });
        }
        finally {
            console.timeEnd(`${symbols[i]}`);
        }
    }

    console.log(`失败交易对 -> ${fail_symbols.join(', ')}`);

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
    return ret.future_index;
}
