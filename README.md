#Dummy.js
* * *
Simple testing of node tcp/tls servers.

Useful with testing libraries such as [Mocha](http://visionmedia.github.com/mocha/) and [Should.js](https://github.com/visionmedia/should.js/).

###Why?
---
Imagine a server that responds with the data you sent it, prepended with 'you sent : ', if we send the server 'hey' it should respond with 'you sent : hey'. Pretty simple, right?. Let's say you wanted to write some tests for your nifty server that verified it's behavior, even when multiple things are sent to the server. Using Mocha and Should.js, let us examine what this code might look like without Dummy.js.

    //leaving the requires out to keep it short
    describe('awesome server', function() {
        //before any tests are run, get an instance of AwesomeServer up and
        //  listening for connections    
        var awesomeServer;
        before(function(done) {
            awesomeServer = new AwesomeServer();
            awesomeServer.listen(1234, function() {
                done();
            });
        });
        it('should respond correctly', function(done) {
            //connect to the AwesomeServer
            var client = net.connect(1234, function() {
                client.write('hey\n');
            });
            //we got some data, let's look at it
            client.on('data', function(data) {
                data = data.toString();
                if(data === 'you sent : hey) {
                    client.write('haha\n');
                } if(data === 'you sent : haha') {
                    done;
                }
            });
        });
    });

This test ignores a lot of things. The server could incorrectly be sending two pieces of data to the client, and they happened to fit into one packet. The server could be sending one very long message that did not fit into one packet of data. We need to delimit our data and work accordingly. Secondly, without adding some sort of count, we cannot be sure that the response received is associated with the first write, or the second write. 

###Dummy.js
---
This is where Dummy.js comes in handy. Let's look at the same problem again, but use Dummy.js.

    //leaving the requires out to keep it short
    describe('awesome server', function() {
        //before any tests are run, get an instance of AwesomeServer up and
        //  listening for connections    
        var awesomeServer;
        before(function(done) {
            awesomeServer = new AwesomeServer();
            awesomeServer.listen(1234, function() {
                done();
            });
        });
        it('should respond correctly', function(done) {
            var dummy = new Dummy(false, 1234, '127.0.0.1', '\n', function() {
                dummy.sendDataExpectResponse('hey\n', 'you sent : hey', function(expected, data) {
                    dummy.sendDataExpectResponse('haha\n', 'you sent : haha', function(expected, data) {
                        expected.should.equal.true;
                        done();
                    });
                });
            });
        });
    });

This makes a lot more sense, and is pretty easy to follow.

###Reference
---
#####Dummy(secure, port, hostname, delimiter, connectionCallback)

The dummy constructor takes five arguments:

    secure : either an object or something else - if object, dummy uses it as a settings object for a tls connection - this can cause an error if the tls library doesn't enjoy your object, pass *false* if not using a secure connection
    port : pretty self explanatory
    hostname : really?
    delimiter : how is the server separating messages
    connectionCallback : a function to call when the client has connected to the server
    
#####sendDataExpectResponse(data, response, responseCallback(expected, data))

Takes three arguments:

    data : the data to send to the server
    response : the response to be expecting from the server
    responseCallback : the callback to call when the server has (or has not) received data in response to sending data, the callback will have two arguments, a boolean that is true or false depending on the server's response matching the response expected, and a data object, that contains the data the server actually received 
    
#####notes

Right now, only send more data to the server in callbacks that the Dummy calls. This keeps weird race conditions from happening. I am working on an implementation around this issue.

This project is very short and sweet, however, I will be making changes to it frequently.

Thanks!
    