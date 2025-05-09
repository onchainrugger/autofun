import fetch from 'node-fetch';

const TOKEN = ''; 
const CHAT_ID = '';          
const API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

const sendMessageToThread = async (message) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',  
        disable_web_page_preview: true, 

      }),
    });
    const data = await response.json();
    if (data.ok) {
      console.log('Message sent successfully to thread:');
    } else {
      console.error('Failed to send message to thread:', error);
    }
  } catch (error) {
    console.error('Error sending message to thread:', error);
  }
};

const newCoin = async () => {
  try {
    const response = await fetch(`https://api.auto.fun/api/tokens?limit=10&page=1&sortBy=createdAt&sortOrder=desc&hideImported=1`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching new coins:', error);
    return null;
  }
};

function formatNumber(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    return num.toString();
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processedTokens = new Set(); // Menyimpan token yang sudah diproses

const processCoinData = async (newLaunch) => {
  for (const [index, launch] of newLaunch.entries()) {
    if (processedTokens.has(launch.mint)) {
      console.log(`[skipped] ${launch.mint} already processed.`);
      continue; // Lewati token yang sudah diproses
    }

    try {
      const coind = launch.mint;
      const ticker = launch.ticker;
      const coinname = launch.name;
      const aw = Number(launch.marketCapUSD);
      const MarketCap = formatNumber(aw.toFixed(2));
      if(launch.verified == 1) {
        var ver = '✅';
      } else {
        var ver = '❌';
      }

      let tag;
      if (launch.verified == 1) {
        tag = `🌐 [${ticker}](https://auto.fun/token/${coind})\n ├ MC : ${MarketCap}\n ├ ${coinname}\n ├ ${ver} Verified \n └ 🧠 [Trojan](https://t.me/hector_trojanbot?start=r-onchainruggers-${coind}) | [BLOOM](https://t.me/BloomSolana_bot?start=ref_verdant_ca_${coind})`;

        console.log(`[criteria] ${launch.mint}`);
        sendMessageToThread(tag)
        processedTokens.add(launch.mint);
      } else {
        
        console.warn(`[not-criteria] ${launch.mint} skipping to next...`);
      }

    } catch (error) {
      console.warn(`[404] error on ${launch.mint}, skipping to next...`, error);
    }

    await delay(10); 
  }
};


const continuouslyFetchAndProcess = async () => {
  while (true) {
    try {
      const newLaunch = await newCoin();
      if (newLaunch.tokens && newLaunch.tokens.length) {
        await processCoinData(newLaunch.tokens);
      }
      await new Promise(resolve => setTimeout(resolve, 10000)); 
    } catch (error) {
      console.error('Error in the continuous fetching loop:', error);
    }
  }
};

continuouslyFetchAndProcess();
