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

function sort(a, b) {
  if (a.value > b.value) {
    return 1;
  }
  else if (a.value < b.value) {
    return -1;
  }
  else {
    return 0;
  }
}

const getApiData = async url => {
  const response = await axios.get(url).then(function (response) {
  let asks = response.data.asks;
  let bids = response.data.bids;

  let res = [];

  for(let i = 0; i < asks.length; i++) {
    asks[i] = {
      value: Number(asks[i][0]),
      volume: Number(asks[i][1])
    };
  }

  asks.sort(sort);
  

  for(let i = 0; i < bids.length; i++) {
    bids[i] = {
      value: Number(bids[i][0]),
      volume: Number(bids[i][1])
    };
  }

  bids.sort(sort);


  for(let i = bids.length - 1; i >= 0; i--) {
    if (i < bids.length - 1) {
      bids[i].bidstotalvolume = bids[i+1].bidstotalvolume + bids[i].volume;
    }
    else {
      bids[i].bidstotalvolume = bids[i].volume;
    }
    var dp = {};
        dp["value"] = bids[i].value;
        dp["bidvolume"] = bids[i].volume;
        dp["bidstotalvolume"] = bids[i].bidstotalvolume;
      
      res.unshift(dp);
  }

  

  for (let i = 0; i < asks.length; i++) {
    if (i > 0) {
      asks[i].askstotalvolume = asks[i-1].askstotalvolume + asks[i].volume;
    }
    else {
      asks[i].askstotalvolume = asks[i].volume;
    } 
    var dp = {};
        dp["value"] = asks[i].value;
        dp["askvolume"] = asks[i].volume;
        dp["askstotalvolume"] = asks[i].askstotalvolume;
        res.push(dp); 
  }
  // let arr = []; 
  //   for (i=0; i<asks.length; i++) {
  //     for (j=0; j<bids.length; j++) {
  //       if (i === j) {
  //         arr.push(asks[i].concat(bids[j]));      
  //     }
  //   } 
  // }
  return res
});
return response;
};


app.get("/", (req, res) => {
  res.render("orderbook");
});


app.get("/orderbook", (req, res) => {
  let firstUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=10";
  let secondUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDC_BTC&depth=10";

  var getData = async function() {
    const firstCoin = await getApiData(firstUrl);
    const secondCoin = await getApiData(secondUrl);

    for (i=0; i<secondCoin.length; i++) {
      if (secondCoin[i].askstotalvolume) {
      secondCoin[i] = { "value" : secondCoin[i].value,
                        "volume" : secondCoin[i].askvolume,
                        "secondcoinaskstotalvolume" : secondCoin[i].askstotalvolume };
      } else if (secondCoin[i].bidstotalvolume) {
       secondCoin[i] =  { "value" : secondCoin[i].value,
                          "volume" : secondCoin[i].bidvolume,
                          "secondcoinbidstotalvolume" : secondCoin[i].bidstotalvolume };
      }
    }
    // let obj = {};
    // for (let i=0; i<firstCoin.length; i++) {
    //   for (let j=0; j<secondCoin.length; j++) {
    //     if (i === j) {
    //       obj[i] = {  'FirstAskPrice' : Number(firstCoin[i][0]),
    //                   'FirstAskVolume' : firstCoin[i][1],
    //                   'FirstBidPrice' : Number(firstCoin[i][2]),
    //                   'FirstBidVolume' : firstCoin[i][3],
    //                   'SecondAskPrice' : Number(secondCoin[j][0]),
    //                   'SecondAskVolume' : secondCoin[j][1],
    //                   'SecondBidPrice' : Number(secondCoin[j][2]),
    //                   'SecondBidVolume' : secondCoin[i][3]  };
    //       // arr.push(usdt[i].concat(usdc[j]));
    //     }
    //   }
    // }
    // let newobj= Object.values(obj);
    // for (let i=0; i<newobj.length; i++) {
    //   if (i > 0) {
    //     obj[i].firstAskTotalVolume = obj[i-1].firstAskTotalVolume + obj[i].FirstAskVolume;
    //     obj[i].secondAskTotalVolume = obj[i-1].secondAskTotalVolume + obj[i].SecondAskVolume;
    //   } else {
    //     obj[i].firstAskTotalVolume = obj[i].FirstAskVolume;
    //     obj[i].secondAskTotalVolume = obj[i].SecondAskVolume;
    //   }
    // }

    // for (let i = newobj.length - 1; i >= 0; i--) {
    //   if (i < (newobj.length - 1)) {
    //     obj[i].firstBidTotalVolume = obj[i+1].firstBidTotalVolume + obj[i].FirstBidVolume;
    //     obj[i].secondBidTotalVolume = obj[i+1].secondBidTotalVolume + obj[i].SecondBidVolume;
    //   }
    //   else {
    //     obj[i].firstBidTotalVolume = obj[i].FirstBidVolume;
    //     obj[i].secondBidTotalVolume = obj[i].SecondBidVolume;
    //   }
    // }            
    res.json(firstCoin.concat(secondCoin));
  };
  getData();
});


app.listen(port, function() {
  console.log("Runnning on " + port);
});
module.exports = app;
