
function () {
$.ajax({
            method: "GET",
            url: "/orderbook"
          }).done((items) => {
            console.log(items);
          });

}