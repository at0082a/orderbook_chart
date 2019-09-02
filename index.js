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

const getApiData = async url => {
  const response = await axios.get(url).then(function (response) {
  let asks = response.data.asks;
  let bids = response.data.bids;
  let arr = [];
    for (i=0; i<asks.length; i++) {
      for (j=0; j<bids.length; j++) {
        if (i === j) {
          arr.push(asks[i].concat(bids[j]));      
      }
    } 
  }
  console.log(arr);
  return arr;
});

return response;
};


app.get("/", (req, res) => {
  res.render("orderbook");
});


app.get("/orderbook", (req, res) => {
  let firstUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=50";
  let secondUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDC_BTC&depth=50";

  var getData = async function() {
    const firstCoin = await getApiData(firstUrl);
    const secondCoin = await getApiData(secondUrl);
    let obj = {};
    for (let i=0; i<firstCoin.length; i++) {
      for (let j=0; j<secondCoin.length; j++) {
        if (i === j) {
          obj[i] = {  'FirstAskPrice' : Number(firstCoin[i][0]),
                      'FirstAskVolume' : firstCoin[i][1],
                      'FirstBidPrice' : Number(firstCoin[i][2]),
                      'FirstBidVolume' : firstCoin[i][3],
                      'SecondAskPrice' : Number(secondCoin[j][0]),
                      'SecondAskVolume' : secondCoin[j][1],
                      'SecondBidPrice' : Number(secondCoin[j][2]),
                      'SecondBidVolume' : secondCoin[i][3]  };
          // arr.push(usdt[i].concat(usdc[j]));
        }
      }
    }
    let newobj= Object.values(obj);
    for (let i=0; i<newobj.length; i++) {
      if (i > 0) {
        obj[i].firstAskTotalVolume = obj[i-1].firstAskTotalVolume + obj[i].FirstAskVolume;
        obj[i].secondAskTotalVolume = obj[i-1].secondAskTotalVolume + obj[i].SecondAskVolume;
      } else {
        obj[i].firstAskTotalVolume = obj[i].FirstAskVolume;
        obj[i].secondAskTotalVolume = obj[i].SecondAskVolume;
      }
    }

    for (let i = newobj.length - 1; i >= 0; i--) {
      if (i < (newobj.length - 1)) {
        obj[i].firstBidTotalVolume = obj[i+1].firstBidTotalVolume + obj[i].FirstBidVolume;
        obj[i].secondBidTotalVolume = obj[i+1].secondBidTotalVolume + obj[i].SecondBidVolume;
      }
      else {
        obj[i].firstBidTotalVolume = obj[i].FirstBidVolume;
        obj[i].secondBidTotalVolume = obj[i].SecondBidVolume;
      }
    }            
    console.log(newobj);
    res.json(newobj);
  };
  getData();
});

// {  'FirstAskPrice' : firstCoin[i][0],
//                       'FirstAskVolume' : firstCoin[i][1],
//                       'FirstBidPrice' : firstCoin[i][2],
//                       'FirstBidVolume' : firstCoin[i][3],
//                       'SecondAskPrice' : secondCoin[j][0],
//                       'SecondAskVolume' : secondCoin[j][1],
//                       'SecondBidPrice' : secondCoin[j][2],
//                       'SecondBidVolume' : secondCoin[i][3],
                      // 'firstBidTotalVolume' :,
                      // 'secondBidTotalVolume' :,  
                      // 'firstAskTotalVolume' :,
                      // 'secondAskTotalVolume' : };


// let sendData = async function () {
//   let firstData = await getFirstCoinData();
//   let secondData = await getSecondCoinData();
//   res.json([firstData, secondData]);
//   return;
// };

// sendData();

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


app.listen(port, function() {
  console.log("Runnning on " + port);
});
module.exports = app;
