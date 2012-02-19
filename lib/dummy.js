var net = require('net');
var tls = require('tls');

var Dummy = function(_secure, _port, _host, _delimeter, _connectCallback) {
    
    var __client = null;
    var __current = null;
    var __delimeter = typeof _delimeter === 'string' ? _delimeter : '\n'
    
    var __connectionListener = function() {
        _connectCallback();
    }
    
    var __dataBuffer = '';
    
    var __dataListener = function(_data) {
        __dataBuffer += _data.toString();
        
        _data = _data.toString();
        if(_data === __pending[0].response) {
            __pending[0].callback(true, _data);
        } else {
            __pending[0].callback(false, _data)
        }
        __pending.splice(0, 1);
    }
    
    //send a group of 
    var __sendGroup = function(_group) {
        //push the group onto the end of the pending stack
        __pending.push(_group);
        //if the group is the only group in the stack, send the first
        //  message in the group to get the chain started
        if(__pending.length === 1) {
            __sendInstance(0);
        }
    }
    
    var __sendInstance = function(_instanceNumber) {
        //get the instance from the current group in the __pending list
        instance = __pending[0].instances[_instanceNumber];
        //if the instance does not exist, and there is a group on the stack,
        //  send the group's completion callback
        if(instance === undefined && __pending[0] !== undefined) {
            var callback = __pending[0].callback();
            __pending.splice(0, 1);
            if(__pending[0] !== undefined) {
                
            }
            __pending.callback()
            
        } else {
            //otherwise, write the data to the client
            __client.write(instance.data);
            //if the instance does not need to wait for a response to send the next instance,
            //  go ahead and send the next instance
            if(instance.waitForExpected === undefined || instance.waitForExpected === null) {
                __sendInstance(_instanceNumber + 1)
            }
        }
    }

    if(_secure) {
        __client = tls.connect(_port, _host, __connectionListener);
    } else {
        __client = net.connect(_port, __connectionListener);
    }
    
    __client.on('data', __dataListener);
    
    return {
        //expects an array of objects with the following fields:
        //  data : the data to send to the server the client is connected to
        //  response : the data that the client should recieve in response to sending 'data,'
        //      note that this can be set to null, and the 'data' will match any 'response'
        //      thus calling the callback for this 'data' with a true value
        //  callback : the function to call when the response has been recieved for
        //      this data, with arguments 'expected' and 'data' - 'expected' is a boolean
        //      value and is true only if 'data' is equal to 'response,' and 'data'
        //      contains the value that the client did recieve from the server (expected
        //      or not)
        //  waitForExpected : true, false, or null or undefined - if TRUE, the dummy will  
        //      wait until the expected data is recieved from the server until sending
        //      the next 'data' in the list, if the dummy recieves something that is
        //      not expected, it will stop sending and empty its queue of messages,
        //      and call the completion callback with an error, if FALSE, the dummy
        //      will wait until recieving the next message before sending the next, but
        //      disregard any differences between the 'data' and 'response,' but will
        //      still call the 'callback' with a value of false, and whatever data the
        //      server did return, if NULL (or undefined), the dummy will send all 
        //      messages in rapid succession, and then wait for responses in the same 
        //      order that it sent them, thus, the first data back should match the 
        //      first data sent, and so forth
        //callback : this is called after ALL messages have been sent, and ALL responses
        //  have been recieved, unless an error has occured, if so, the callback should
        //  accept an error argument, that is filled with an error message
        sendDataExpectingResponses : function(_dataForResponsesWithCallbacks, _callback) {
            var sendGroup = {
                instances : _dataForResponsesWithCallbacks
                callback : _callback
            }
            __sendGroup(sendGroup);
        }
    }
}

module.exports = Dummy;

