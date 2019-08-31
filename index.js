const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const port = process.env.PORT || 3001;
const axios = require('axios');

app.use(logger("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");


let res = [];

function getApiData (list, type, desc)  {
  
  for(var i = 0; i < list.length; i++) {
    list[i] = {
      value: Number(list[i][0]),
      volume: Number(list[i][1]),
    };
  }
  // Sort list just in case
  list.sort(function(a, b) {
    if (a.value > b.value) {
      return 1;
    }
    else if (a.value < b.value) {
      return -1;
    }
    else {
      return 0;
    }
  });

  // Calculate cummulative volume
  if (desc) {
    for(var i = list.length - 1; i >= 0; i--) {
      if (i < (list.length - 1)) {
        list[i].totalvolume = list[i+1].totalvolume + list[i].volume;
      }
      else {
        list[i].totalvolume = list[i].volume;
      }
      var dp = {};
      dp["value"] = list[i].value;
      dp[type + "volume"] = list[i].volume;
      dp[type + "totalvolume"] = list[i].totalvolume;
      res.unshift(dp);
    }
  }
  else {
    for(var i = 0; i < list.length; i++) {
      if (i > 0) {
        list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
      }
      else {
        list[i].totalvolume = list[i].volume;
      }
      var dp = {};
      dp["value"] = list[i].value;
      dp[type + "volume"] = list[i].volume;
      dp[type + "totalvolume"] = list[i].totalvolume; 
      res.push(dp);
    }
  }
  return res;
}


app.get("/", (req, res) => {
  res.render("orderbook");
});

app.get("/apiorder", (req, res) => {
  console.log("hellooooo");
  let firstUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=10";
  let secondUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDC_BTC&depth=10";

let getFirstCoinData = async function() {
  const firstCoinAsks = await axios.get(firstUrl).then(function (response) {
    let getData = getApiData(response.data.asks, 'asks', false);
    return getData;
});
  const firstCoinBids = await axios.get(firstUrl).then(function (response) {
    let getData = getApiData(response.data.bids, "bids", true);
    return getData;
}); 
  let processed = {'FIRSTCOIN' : [firstCoinAsks, firstCoinBids]};
  return processed;
};

let getSecondCoinData = async function() {
  const secondCoinAsks = await axios.get(secondUrl).then(function (response) {
    let getData = getApiData(response.data.asks, 'asks', false);
    return getData;
});
  const secondCoinBids = await axios.get(secondUrl).then(function (response) {
    let getData = getApiData(response.data.bids, "bids", true);
    return getData;
}); 
  let processed = {'SECONDCOIN' : [secondCoinAsks, secondCoinBids]};
  return processed;
};

// var getSecondData = async function() {
//     const secondCoin = await axios.get(usdcUrl).then(function () {
//       getApiData(response.asks, 'asks', false);
//       getApiData(response.bids, "bids", true);
//     });
//   return secondCoin;
// };
let sendData = async function () {
  let firstData = await getFirstCoinData();
  let secondData = await getSecondCoinData();
  res.json([firstData, secondData]);
  return;
};

sendData();

  //   let obj = {};
  //   for (let i=0; i<usdt.length; i++) {
  //     for (let j=0; j<usdc.length; j++) {
  //       if (i === j) {
  //         obj[i] = {  'USDTAskPrice' : usdt[i][0],
  //                     'USDTAskVolume' : usdt[i][1],
  //                     'USDTBidPrice' : usdt[i][2],
  //                     'USDTBidVolume' : usdt[i][3],
  //                     'USDCAskPrice' : usdc[j][0],
  //                     'USDCAskVolume' : usdc[j][1],
  //                     'USDCBidPrice' : usdc[j][2],
  //                     'USDCBidVolume' : usdt[i][3]  };
  //         // arr.push(usdt[i].concat(usdc[j]));
  //       }
  //     }
  //   }
  //   res.send(usdt);
  //  };
  // getData();
});

app.listen(port, function() {
  console.log("Runnning on " + port);
});
module.exports = app;
