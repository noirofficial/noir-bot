#!/usr/bin/env nodejs

// 
// Discord Bot, designed to for displaying information about the noirnode
//
// Requirements:
//
// Ubuntu packages: 
//
// apt-get install -y nodejs npm
//
// NPM packages: 
//
// npm install woor/discord.io#gateway_v6 --save
// npm install winston
// npm install request
//	
// The Discord App API token must be stored in auth.json 
//
// Add the bot to a server via:
//
// https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=0
//
//
  
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

const request = require('request');

// Set this to the channelID you want the bot to bind to
const enableChannelBinding = true
const bindChannelID = ['723502371749101610','426110666269523971'];

// Needed for executing shell commands
const { exec } = require('child_process');

// noirnode coinmarketcap
const noir_cmc_url = "https://api.coinmarketcap.com/v1/ticker/noir";

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// var for storing the average blocktime
var avgBlocktime;

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

logger.info('Initialized');

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
	
	// First check if this message came from the bindChannelID
	// If not: return
	if (enableChannelBinding && !(bindChannelID.indexOf(channelID) > -1)) { return }
    

    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
				break;
		
		case 'help':
			help(channelID);
			break;
		
		case 'diff':
			noirDiffHandler(channelID);
			break;
			
		case 'noirnode':
			noirnodeCountHandler(channelID);
			break;
		
		case 'value':
			noirnodeValue(channelID);
			break;
		
		case 'block':
			noirBlockHandler(channelID);
			break;
		
		case 'price':
			noirPriceHandler(channelID);
			break;
		
		case 'priceUSD':
			priceUSD(channelID);
			break;
		
		case 'priceGBP':
			priceGBP(channelID);
			break;
		
		case 'priceEUR':
			priceEUR(channelID);
			break;
		
		case 'supply':
			noirSupplyHandler(channelID);
			break;

		case 'rank':
			noirCmcRank(channelID);
			break;
			
		case 'abt':
			calculateAvgBlocktime(channelID);
		break
        }
     }
});

function help(channelID) {
	var msg = '```Markdown\n';
	msg += 'Noirbot - Help\n';
	msg += '--------------\n\n';
	msg += 'Command List:\n';
	msg += '\n!block:    Current blockheight';
	msg += '\n!diff:     Difficulty';
	msg += '\n!help:     This command list';
	msg += '\n!price:    Noir price and volume';
	msg += '\n!priceEUR:    Noir price in EUR';
	msg += '\n!priceUSD:    Noir price in GBP';
	msg += '\n!priceGBP:    Noir price in USD';
	msg += '\n!rank:     Noir CoinGecko rank';
	msg += '\n!supply:   Noir Supply';
	msg += '\n!value:    noirnode value';
	msg += '\n!abt:      average block time';
	msg += '\n!noirnode: noirnode count and ROI```';
	
	bot.sendMessage({
	                    to: channelID,
	                    message: msg
	            	});
	
}

// noirnode ROI
function noirnodeCountHandler(channelID) {
	logger.info('noirnodeCountHandler');
	
	var enabled;
	var pre_enabled;
	var new_start_required;
	var expired;
	var count;
	
	var noir_per_day;
	var roi_percent;
	
	var blockTime;
	var dynamic_noir_per_day;
	var dynamic_roi_percent;
	
	var exec_loop = 0
	
	/*exec('noir-cli getnetworkhashps', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
		hashrate = stdout;
		exec_loop++;	
		
		if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	exec('noir-cli getinfo | grep difficulty | awk \'{print $2\'} | cut -d "," -f 1', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	diff = stdout;
	  	exec_loop++;
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});*/

	calculateAvgBlocktimeFornoirnodes(function(avgBlocktime) {
		blockTime = avgBlocktime
		exec_loop ++
	})
	
	exec('./noir-cli noirnode list | grep -i \\\"ENABLED\\\" | wc -l', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	enabled = stdout;
	  	exec_loop++;
	  	
	  	/*var intervalID = setInterval (function () {
	        if (diff && hashrate) {
		        clearInterval(intervalID);
				
				blockTime = (diff * 2**32 / hashrate) / 60
			  	const blocksPerDay = 24 * 60 / blockTime
			  	
			  	dynamic_noir_per_day = toFixed((blocksPerDay / enabled) * 8.125, 2);
			  	dynamic_roi_percent = toFixed((dynamic_noir_per_day * 365 / 25000) * 100, 2);
			  	
			  	noir_per_day = toFixed((576 / enabled) * 8.125, 2);
			  	roi_percent = toFixed((noir_per_day * 365 / 25000) * 100, 2);
			  	exec_loop++;
			}
      	}, 100); // 0.1 Second interval
	  	*/
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	exec('./noir-cli noirnode list | grep -i \\\"PRE_ENABLED\\\" | wc -l', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	pre_enabled = stdout;
	  	exec_loop++;
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	exec('./noir-cli noirnode list | grep -i \\\"NEW_START_REQUIRED\\\" | wc -l', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	new_start_required = stdout;
	  	exec_loop++;
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	exec('./noir-cli noirnode list | grep -i \\\"EXPIRED\\\" | wc -l', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	expired = stdout;
	  	exec_loop++;
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	exec('./noir-cli noirnode count', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	count = stdout;
	  	exec_loop++;
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	var intervalID = setInterval (function () {
        if (exec_loop == 6) {
	        clearInterval(intervalID);
			
			const blocksPerDay = 24 * 60 / blockTime
			  	
		  	dynamic_noir_per_day = toFixed((blocksPerDay / enabled) * 1.1, 2);
		  	dynamic_roi_percent = toFixed((dynamic_noir_per_day * 365 / 25000) * 100, 2);
		  	
		  	noir_per_day = toFixed((576 / enabled) * 1.1, 2);
		  	roi_percent = toFixed((noir_per_day * 365 / 25000) * 100, 2);
			  	
			var msg = '```md\n';
			msg += 'Noirnodes - Count, Income and ROI\n';
			msg += '--------------------------------\n\n';
			msg += '[noirnode - Status]\n\n'
			msg += 'Total Nodes:        ' + count;
			msg += 'Enabled:            ' + enabled;
			msg += 'Pre Enabled:        ' + pre_enabled;
			msg += 'New Start Required: ' + new_start_required;
			msg += 'Expired:            ' + expired;
			msg += '\n';
			msg += '[noirnode - Earnings and ROI]\n\n';
			msg += 'Theoretical blocktime of 2.5m:\n\n';
			msg += 'Noir per day: ' + noir_per_day + '\n';
			msg += 'Yearly ROI:   ' + roi_percent + '%\n\n';
			msg += 'Last 576 blocks, avg blocktime of ' + toFixed(blockTime,2) + 'm:\n\n';
			msg += 'Noir per day: ' + dynamic_noir_per_day + '\n';
			msg += 'Yearly ROI:   ' + dynamic_roi_percent + '%```';
			bot.sendMessage({to: channelID, message: msg});
		}
      }, 250); // 0.25 Second interval
}

// noir blockHeight
function noirBlockHandler(channelID) {
	var hashrate;
	var diff;
	var blockHeight;
	
	var exec_loop = 0;
	
	exec('./noir-cli getnetworkhashps', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
		hashrate = stdout;
		exec_loop++;	
		
		if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	exec('./noir-cli getinfo | grep difficulty | awk \'{print $2\'} | cut -d "," -f 1', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	diff = stdout;
	  	exec_loop++;
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	exec('./noir-cli getinfo | grep blocks | awk \'{print $2\'} | cut -d "," -f 1', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	blockHeight = stdout;
	  	exec_loop++;
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
	
	var intervalID = setInterval (function () {
        if (exec_loop == 3) {
	        clearInterval(intervalID);
			
			const blockTime = toFixed((diff * 2**32 / hashrate) / 60, 2)
			
			var msg = '```md\n';
		  	msg += 'Noir - Current Blockheight\n';
		  	msg += '--------------------------\n\n';
		  	msg += 'Block:      ' + blockHeight;
		  	msg += 'Block Time: ' + blockTime + 'm```';
		  	
			bot.sendMessage({to: channelID, message: msg});
		}
    }, 250); // 0.25 Second interval
}

// noir Difficulty
function noirDiffHandler(channelID) {
	
	exec('./noir-cli getinfo | grep difficulty | awk \'{print $2\'} | cut -d "," -f 1', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	
	  	var msg = '```md\n';
	  	msg += 'Noir - Difficulty\n'
	  	msg += '-----------------\n\n'
	  	msg += 'Current Difficulty: ' + stdout + '```';
	  	
	  	bot.sendMessage({to: channelID, message: msg});
	  	
	    if (stderr) { logger.error(`stderr: ${stderr}`); }
	});
}

// noirnode Value
function noirnodeValue(channelID) {
	getCoinGeckoData(channelID,function(json){
		
		const usdPrice = toFixed(json.market_data.current_price.usd * 25000,2);
		const btcPrice = toFixed(json.market_data.current_price.btc * 25000,2);
		
		var msg = '```md\n';
	  	msg += 'Noirnode - Value\n'
	  	msg += '---------------\n\n'
	  	msg += 'USD: $' + numberWithCommas(usdPrice);
	  	msg += '\nBTC: ₿' + btcPrice + '```';
	  	
		bot.sendMessage({to: channelID, message: msg});
	})
}

// noirnode Price
function noirPriceHandler(channelID) {
	getCoinGeckoData(channelID,function(json){
        const usdPrice = json.market_data.current_price.usd;
        const btcPrice = json.market_data.current_price.btc;
        const percent_change_24h = json.market_data.price_change_percentage_24h;
        const percent_change_7d = json.market_data.price_change_percentage_7d;
        const percent_change_14d = json.market_data.price_change_percentage_14d;
        const circulating_supply = json.market_data.circulating_supply;
        const market_cap_usd = json.market_data.market_cap.usd;
        const volume_usd = json.market_data.total_volume.usd;
        
        var msg = '```md\n';
        msg += 'Noir - Price & Volume\n'
        msg += '------------------------\n\n'
        msg += '[Noir - Price]\n\n'
        msg += 'USD: $' + usdPrice;
        msg += '\nBTC: ₿' + btcPrice;
        msg += '\n\n';
        msg += '[Noir - Price Change]\n\n';
        msg += 'Change  1 hour:  ' + percent_change_24h + '%\n';
        msg += 'Change 24 hours: ' + percent_change_7d + '%\n';    
        msg += 'Change  7 days:  ' + percent_change_14d + '%\n\n';
        msg += '[Noir - Volume]\n\n';
        msg += '24h Volume: $' + numberWithCommas(volume_usd | 0) + '\n';
        msg += 'Circulating supply: ' + circulating_supply + ' NOR' + '\n';
        msg += 'Marketcap:  $' + numberWithCommas(toFixed(market_cap_usd,2)) + '```';
        
        bot.sendMessage({to: channelID, message: msg});
    })
}

function priceUSD(channelID){
    getCoinGeckoData(channelID,function(json){
        var msg = '```md\n';;
        msg += 'Noir - Price Euro\n';
        msg += '--------------------------\n\n';
        msg += 'EUR: €' + json.market_data.current_price.eur;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    })
}

function priceEUR(channelID){
    getCoinGeckoData(channelID,function(json){
        var msg = '```md\n';;
        msg += 'Noir - Price Euro\n';
        msg += '--------------------------\n\n';
        msg += 'EUR: €' + json.market_data.current_price.eur;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    })
}

function priceGBP(channelID){
    getCoinGeckoData(channelID,function(json){
        var msg = '```md\n';;
        msg += 'Noir - Price Euro\n';
        msg += '--------------------------\n\n';
        msg += 'EUR: €' + json.market_data.current_price.eur;
        msg += '```';
        bot.sendMessage({ to: channelID, message: msg});
    })
}

// noir Supply
function noirSupplyHandler(channelID) {
	getCoinGeckoData(channelID,function(json){
		
		const available_supply = json.market_data.circulating_supply;
		const total_supply = json.market_data.total_supply;
		
		exec('./noir-cli noirnode count', {shell: '/bin/bash'}, (error, stdout, stderr) => {
			if (error) {
		    	console.error(`exec error: ${error}`);
				return;
		  	}
		  	if (stderr) { logger.error(`stderr: ${stderr}`); }
			
			
		  	const locked_in_nodes = stdout * 25000;
		  	const circulating = available_supply - locked_in_nodes;
		  	
		  	const lock_percent = toFixed(100 / total_supply * locked_in_nodes, 2);
		  	const circ_percent = toFixed(100 - lock_percent, 2);
		  	
			var msg = '```md\n';
		  	msg += 'Noir - Supply\n'
		  	msg += '-------------\n'
		  	msg += '\nAvailable supply: ' + numberWithCommas(available_supply | 0);
		  	msg += '\nTotal supply:     ' + numberWithCommas(total_supply | 0);
		  	msg += '\n';
		  	msg += '\nLocked in nodes:   ' + numberWithCommas(locked_in_nodes | 0) + ' - ' + lock_percent + '%';
		  	msg += '\nCirculating:      ' + numberWithCommas(circulating | 0) + ' - ' + circ_percent + '%```'
		  	
		  	bot.sendMessage({to: channelID, message: msg});
		 });
	})
}

// noir CMC Rank
function noirCmcRank(channelID) {
	getCoinGeckoData(channelID,function(json){
		
		const rank = json.coingecko_rank;
		
		var msg = '```md\n';
	  	msg += 'Noir - CoinGecko Rank\n'
	  	msg += '-------------------------\n\n'
	  	msg += 'Rank: ' + rank + '```';
	  
		bot.sendMessage({to: channelID, message: msg});
	})
}

// Get CoinMarketCap noir API Results
function getCMCJSON(channelID,callback) {
	request.get(noir_cmc_url, (error, response, body) => {
		if (error) { 
			bot.sendMessage({
	                to: channelID,
	                message: '**Error:** CoinMarketCap API seems to be in trouble. Try again later!'
	        		});
		} else {
			let json = JSON.parse(body)
			callback(json);
		}
	});
}

function getCoinGeckoData(channelID,callback){
    request.get('https://api.coingecko.com/api/v3/coins/bring', (error, response, body) => {
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

// Calculate the avg blocktime
function calculateAvgBlocktime(channelID) {
	
	// Define the number of blocks to calculate the average blocktime
	const blocks = 576;
	
	var diff;
	var blockCounter;
	
	exec('./noir-cli getblockcount', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	if (stderr) { logger.error(`stderr: ${stderr}`); }
		
	  	const lastBlock = stdout;
	  	const firstBlock = lastBlock - blocks + 1;
	  	
	  	getBlock(lastBlock, function(block) { 
		  	const lastBlock = block;
		  	
		  	getBlock(firstBlock, function(block) {
			  	const firstBlock = block;
			  	
			  	let avgTime = parseFloat((lastBlock["time"] - firstBlock["time"]) / blocks / 60).toFixed(2);
			  	
				var msg = '```md\n';
			  	msg += 'Noir - Average Block Time\n'
			  	msg += '--------------------------\n\n'
			  	msg += 'Time: ' + avgTime + ' minutes```';

				bot.sendMessage({to: channelID, message: msg});	
		  	})
	  	})
	});
}

// Calculate the avg blocktime
function calculateAvgBlocktimeFornoirnodes(callback) {
	
	// Define the number of blocks to calculate the average blocktime
	const blocks = 576;
	
	var diff;
	var blockCounter;
	
	exec('./noir-cli getblockcount', {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	if (stderr) { logger.error(`stderr: ${stderr}`); }
		
	  	const lastBlock = stdout;
	  	const firstBlock = lastBlock - blocks + 1;
	  	
	  	getBlock(lastBlock, function(block) { 
		  	const lastBlock = block;
		  	
		  	getBlock(firstBlock, function(block) {
			  	const firstBlock = block;
			  	
			  	let avgTime = parseFloat((lastBlock["time"] - firstBlock["time"]) / blocks / 60).toFixed(2);
			  	
				callback(avgTime);
		  	})
	  	})
	});
}

function getBlock(blockNumber, callback) {
	exec('./noir-cli getblockhash ' + blockNumber, {shell: '/bin/bash'}, (error, stdout, stderr) => {
		if (error) {
	    	console.error(`exec error: ${error}`);
			return;
	  	}
	  	if (stderr) { logger.error(`stderr: ${stderr}`); }
		
	  	const blockHash = stdout;
	  	
	  	exec('./noir-cli getblock ' + blockHash, {shell: '/bin/bash'}, (error, stdout, stderr) => {
			if (error) {
		    	console.error(`exec error: ${error}`);
				return;
		  	}
		  	if (stderr) { logger.error(`stderr: ${stderr}`); }
			
			let json = JSON.parse(stdout);
		  	
		  	callback(json)
	 	});
 	});
}

function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
