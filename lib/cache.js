'use strict';
const cache = { min_5: [], min_10: [], min_15: [], min_30: [], rate: 0 };

exports.get_cache = (m) => {
    return {
        rate: cache.rate
        , data: cache[`min_${m}`]
    };
}

exports.set_cache = (m, arr, rate) => {
    cache[`min_${m}`] = arr;
    cache.rate = rate;
}