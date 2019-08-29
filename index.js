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
  return arr;
});
  return response;
};

app.get("/", (req, res) => {
  res.render("orderbook");
});

app.get("/orderbook", (req, res) => {
  let usdtUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=50";
  let usdcUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDC_BTC&depth=50";

  var getData = async function() {
    const usdt = await getApiData(usdtUrl);
    const usdc = await getApiData(usdcUrl);
    let obj = {};
    for (let i=0; i<usdt.length; i++) {
      for (let j=0; j<usdc.length; j++) {
        if (i === j) {
          obj[i] = {  'USDTAskPrice' : usdt[i][0],
                      'USDTAskVolume' : usdt[i][1],
                      'USDTBidPrice' : usdt[i][2],
                      'USDTBidVolume' : usdt[i][3],
                      'USDCAskPrice' : usdc[j][0],
                      'USDCAskVolume' : usdc[j][1],
                      'USDCBidPrice' : usdc[j][2],
                      'USDCBidVolume' : usdt[i][3]  };
          // arr.push(usdt[i].concat(usdc[j]));
        }
      }
    }
    res.json(Object.values(obj));
  };
  getData();
});

app.listen(port, function() {
  console.log("Runnning on " + port);
});
module.exports = app;
