var net = require('net');
var colors = require('colors');
var should = require('should');

var Dummy = require('../lib/dummy');

var server;
var serverPort = 11110;

describe('dummy', function() {
    before(function(_done) {
        server = net.createServer(function(_socket) {
            var dataBuffer = '';
            _socket.on('data', function(_data) {
        		dataBuffer += _data.toString();
        		//split the dataBuffer on the newline character, this is because
        		//  multiple messages may have fit into one packet
        		var subdata = dataBuffer.split('\n');
        		for(var i = 0; i < subdata.length - 1; i++)	{
                    //parse each message into an object
        			handle(subdata[i]);
        		}
        		//if the last message in the array did not have a newline at the end
        		//  set that equal to the buffer, as the end of the message should be
        		//  contained in the next packet
        		dataBuffer = subdata[subdata.length - 1];
            });
            
            var handle = function(_data) {
                var responseData = "you sent : " + _data.toString();
                _socket.write(responseData);
            }
        });
        server.listen(serverPort, function() {
           _done(); 
        });
    });
    after(function(_done) {
        server.close();
        _done();
    })
    describe('#Dummy()', function() {
        it('should return a new dummy client, and connect to a server', function(_done) {
            var dummy = new Dummy(false, serverPort, '127.0.0.1', '\n', function() {
                should.exist(dummy);
                _done();
            });
        });
    });
    describe('#sendDataExpectingResponse()', function(_done) {
        it('should get a callback when the data responded was equal to what was respected', function(_done) {
            var dummy = new Dummy(false, serverPort, '127.0.0.1', '\n', function() {
                dummy.sendItemExpectResponse('hey\n', 'you sent : hey', function(_expected, _data) {
                    _expected.should.be.true;
                    _done();
                });
            });
        });
        it('should function correctly with nested calls', function() {
            var dummy = new Dummy(null, serverPort, '127.0.0.1', '\n', function() {
                dummy.sendItemExpectResponse('hey\n', 'you sent : hey', function(_expected, _data) {
                    _expected.should.be.true;
                    dummy.sendItemExpectResponse('yo\n', 'you sent : yo', function(_expected, _data) {
                        _expected.should.be.true;
                        _done();
                    });
                });
            });
        });
    });
});