var colors = require('colors');

var send = function(_string, _callback) {
        console.log(_string);
        _callback();
}

send('a', function() {
    send('b', function() {
        send('c', function() {
            console.log('done');
        });
        send('d', function() {
            
        });
    });
    send('e', function() {
        
    });
});