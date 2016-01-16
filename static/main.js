function transform(feed, interval) {
    return window.location +
           "api/" +
           encodeURIComponent(feed) +
           "/" +
           Math.floor(Date.now()/1000).toString() +
           "/" +
           interval + 
           "/";
}

window.onload = function() {
    var input = document.getElementById("feed-url");
    var interval = document.getElementById("interval");
    var out = document.getElementById("api-url");
    input.addEventListener("keyup", function() {
        beep();
    }, false);
    interval.addEventListener("change", function() {
        beep();
    }, false);
    out.addEventListener("mousemove", function() {
        this.select();
    });

    function beep() {
        out.value = transform(
            input.value,
            +Math.round(Number(interval.value)*24*60*60)
        );
    }
}
