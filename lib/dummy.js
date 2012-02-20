var net = require('net');
var tls = require('tls');

var Dummy = function(_secure, _port, _host, _delimeter, _connectCallback) {
    
    //holds private members
    var Dummy = {};
    
    Dummy.client = null;
    Dummy.currentPair;
    Dummy.delimeter = typeof _delimeter === 'string' ? _delimeter : '\n';
    Dummy.dataBuffer = '';
    
    
    Dummy.connectionListener = function() {
        _connectCallback();
    }    
    
    Dummy.dataListener = function(_data) {
        //add the data to the databuffer, in case the last _data didn't contain a delimeter
        Dummy.dataBuffer += _data.toString();
        //split the data into fields based on the delimeter
        var subdata = Dummy.dataBuffer.split(Dummy.delimeter); 
        if(subdata.length > 0) {
            //by default, the response and the expected response do not match, but check for a match
            var match = false;
            if(subdata[0] === Dummy.currentPair.response) {
                match = true;
            }
            //save the callback, we're removing the currentPair object
            var callback = Dummy.currentPair.callback;
            Dummy.currentPair = null;
            //reset the dataBuffer, since we're not queuing messages (yet), we just expect that the
            //  server had something else at the end of this data that we didn't need...
            Dummy.dataBuffer = '';
            //call the callback for this pair of data/response
            callback(match, subdata[0]);
        }
               
    }
    
    //if the secure argument is an object, attempt to secure a tls connection with the object as
    //  the tls settings object, connect using the net library otherwise
    if(typeof _secure === 'object') {
        Dummy.client = tls.connect(_port, _host, _secure, Dummy.connectionListener);
    } else {
        Dummy.client = net.connect(_port, _host, Dummy.connectionListener);
    }
    
    //on data, call the Dummy.dataListener function, no anon functions here.
    Dummy.client.on('data', Dummy.dataListener);
    
    return {
        send: function(_data, _response, _callback) {
            //save the current pair, and send the _data to the server
            Dummy.currentPair = {data: _data, response: _response, callback: _callback};
            Dummy.client.write(_data);
        }
    }
}

module.exports = Dummy;

