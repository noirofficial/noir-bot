var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

const got = require('got');
const request = require('request');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';


// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});


bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it needs to execute a command
    // for this script it will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);

        switch(cmd) {
            // !ping
            case 'help':
                help(channelID);
                break;
            case 'price':
                price(channelID);
                break;
            case 'priceUSD':
                priceUSD(channelID);
                break;
            case 'priceEUR':
                priceEUR(channelID);
                break;
            case 'priceGBP':
                priceGBP(channelID);
                break;
            case 'diff':
                diff(channelID);
                break;
            case 'block':
                block(channelID);
                break;
            case 'hash':
                hash(channelID);
                break;
            case 'nnValue':
                nnValue(channelID);
                break;
            case 'nn':
                nn(channelID);
                break;
            default: //do nothing
        }
    }
})

function help(channelID){
    var msg = '```Markdown\n';
    msg += 'Noir-bot - Help\n';
    msg += '--------------------------------------\n\n';
    msg += 'Command List:\n';
    msg += '\n!help:        This command list';
    msg += '\n!price:       Noir price and volume';
    msg += '\n!priceUSD:    Noir price in USD';
    msg += '\n!priceEUR:    Noir price in Euro';
    msg += '\n!priceGBP:    Noir price in GBP'
    msg += '\n!diff:        Noir network difficullty';
    msg += '\n!block:       Noir network block height';
    msg += '\n!hash:        Noir network hashrate';
    msg += '\n!nnValue:     Noirnode Value';
    msg += '\n!nn:          Noirnode Info';
    msg += '```';
    
    bot.sendMessage({to: channelID, message: msg});
}

function price(channelID){
    getCoinmarketcapData(function(json){
        
        const usdPrice = json[0].price_usd;
        const btcPrice = json[0].price_btc;
        const percent_change_1h = json[0].percent_change_1h;
        const percent_change_24h = json[0].percent_change_24h;
        const percent_change_7d = json[0].percent_change_7d;
        const volume_usd = json[0]['24h_volume_usd'];
        const market_cap_usd = json[0].market_cap_usd;
        
        var msg = '```md\n';
        msg += 'Noir - Price & Volume\n'
        msg += '------------------------\n\n'
        msg += '[Noir - Price]\n\n'
        msg += 'USD: $' + usdPrice;
        msg += '\nBTC: ₿' + btcPrice;
        msg += '\n\n';
        msg += '[Noir - Price Change]\n\n';
        msg += 'Change  1 hour:  ' + percent_change_1h + '%\n';
        msg += 'Change 24 hours: ' + percent_change_24h + '%\n';    
        msg += 'Change  7 days:  ' + percent_change_7d + '%\n\n';
        msg += '[Noir - Volume]\n\n';
        msg += '24h Volume: $' + numberWithCommas(volume_usd | 0) + '\n';
        msg += 'Marketcap:  $' + numberWithCommas(toFixed(market_cap_usd,2)) + '```';
        
        bot.sendMessage({to: channelID, message: msg});
    })
}

function priceUSD(channelID){
    got('https://api.coingecko.com/api/v3/coins/zoin', { json: true }).then(response => {
        console.log(response.body.market_data.current_price.usd);
        var msg = '```md\n';
        msg += 'Noir - Price US Dollar\n';
        msg += '--------------------------\n\n';
        msg += 'USD: $' + response.body.market_data.current_price.usd;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    }).catch(error => {
        console.log(error.response.body);
    });
}

function priceEUR(channelID){
    got('https://api.coingecko.com/api/v3/coins/zoin', { json: true }).then(response => {
        console.log(response.body.market_data.current_price.eur);
        var msg = '```md\n';;
        msg += 'Noir - Price Euro\n';
        msg += '--------------------------\n\n';
        msg += 'EUR: €' + response.body.market_data.current_price.eur;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    }).catch(error => {
        console.log(error.response.body);
    });
}

function priceGBP(channelID){
    got('https://api.coingecko.com/api/v3/coins/zoin', { json: true }).then(response => {
        console.log(response.body.market_data.current_price.gbp);
        var msg = '```md\n';;
        msg += 'Noir - Price GBP\n';
        msg += '--------------------------\n\n';
        msg += 'GBP: £' + response.body.market_data.current_price.gbp;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    }).catch(error => {
        console.log(error.response.body);
    });
}

function diff(channelID){
    got('http://explorer.official-zoin.org/api/getdifficulty', { json: true }).then(response => {
        console.log(response.body);
        var msg = '```md\n';;
        msg += 'Noir - Network Difficullty\n';
        msg += '--------------------------\n\n';
        msg += 'Difficullty: ' + response.body;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    }).catch(error => {
        console.log(error.response.body);
    });
}

function block(channelID){
    got('http://explorer.official-zoin.org/api/getblockcount', { json: true }).then(response => {
        console.log(response.body);
        var msg = '```md\n';;
        msg += 'Noir - Network block height\n';
        msg += '--------------------------\n\n';
        msg += 'Block height: ' + response.body;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    }).catch(error => {
        console.log(error.response.body);
    });
}

function hash(channelID){
    got('http://explorer.official-zoin.org/api/getnetworkhashps', { json: true }).then(response => {
        console.log(response.body);
        var msg = '```md\n';;
        msg += 'Noir - Network hashrate\n';
        msg += '--------------------------\n\n';
        msg += 'hashrate: ' + response.body;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    }).catch(error => {
        console.log(error.response.body);
    });
}

function nnValue(channelID) {
    getCoinmarketcapData(function(json){
        
        const usdPrice = toFixed(json[0].price_usd * 25000,2);
        const btcPrice = toFixed(json[0].price_btc * 25000,2);
        
        var msg = '```md\n';
        msg += 'Noirnode - Value\n'
        msg += '--------------------------\n\n'
        msg += 'USD: $' + numberWithCommas(usdPrice);
        msg += '\nBTC: ₿' + btcPrice + '```';
        
        bot.sendMessage({to: channelID, message: msg});
    })
}

function nn(channelID) {
    getNoirnodeData(function(json){
       const masterNodeCount = toFixed(json.advStats.masterNodeCount);
       const dailyReward = toFixed(json.stats.income.daily, 2);
       const weeklyReward = toFixed(json.stats.income.weekly, 2);
       const yearlyReward = toFixed(json.stats.income.yearly, 2);
       const lockedCoins = toFixed(json.advStats.coinLocked.total);

       var msg = '```md\n';
        msg += 'Noirnode - Info\n'
        msg += '--------------------------\n\n'
        msg += 'Count: ' + masterNodeCount + '\n';
        msg += 'Locked Coins: ' + lockedCoins + ' NOR\n\n';
        msg += 'Daily reward: ' + dailyReward + ' $\n';
        msg += 'Weekly reward: ' + weeklyReward + ' $\n';
        msg += 'Yearly reward: ' + yearlyReward + ' $\n';
        msg += '```';
        
        bot.sendMessage({to: channelID, message: msg});
    })
}

function getCoinGeckoData(callback){
    request.get('https://api.coingecko.com/api/v3/coins/zoin', (error, response, body) => {
        if (error) { 
            bot.sendMessage({
                    to: channelID,
                    message: '**Error:** CoinGecko API seems to be in trouble. Try again later!'
                    });
        } else {
            const json = JSON.parse(body)
            callback(json);
        }
    });
}

function getCoinmarketcapData(callback) {
    request.get('https://api.coinmarketcap.com/v1/ticker/zoin', (error, response, body) => {
        if (error) { 
            bot.sendMessage({
                    to: channelID,
                    message: '**Error:** CoinMarketCap API seems to be in trouble. Try again later!'
                    });
        } else {
            const json = JSON.parse(body)
            callback(json);
        }
    });
}

function getNoirnodeData(callback) {
    request.get('https://masternodes.pro/apiv2/coin/stats/zoi/', (error, response, body) => {
        if (error) { 
            bot.sendMessage({
                    to: channelID,
                    message: '**Error:** Noirnode API seems to be in trouble. Try again later!'
                    });
        } else {
            const json = JSON.parse(body)
            callback(json);
        }
    });
    
}

function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
