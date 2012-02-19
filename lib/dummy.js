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
        Dummy.dataBuffer += _data.toString();
        var subdata = Dummy.dataBuffer.split(Dummy.delimeter); 
        var match = false;
        if(subdata[0] === Dummy.currentPair.response) {
            match = true;
        }
        var callback = Dummy.currentPair.callback;
        Dummy.currentPair = null;
        Dummy.dataBuffer = '';
        callback(match, subdata[0]);        
    }

    if(typeof _secure === 'object') {
        Dummy.client = tls.connect(_port, _host, _secure, Dummy.connectionListener);
    } else {
        Dummy.client = net.connect(_port, _host, Dummy.connectionListener);
    }
    
    Dummy.client.on('data', Dummy.dataListener);
    
    return {
        sendItemExpectResponse: function(_data, _response, _callback) {
            Dummy.currentPair = {data: _data, response: _response, callback: _callback};
            Dummy.client.write(_data);
        }
    }
}

module.exports = Dummy;

