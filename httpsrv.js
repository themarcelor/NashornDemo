#!/usr/bin/jjs -scripting
#

/*
  Author: Marcelo Rodrigues
  Date:   May-2013
  Email:  themarcelor@gmail.com
*/

//"imports"
var Thread            = java.lang.Thread;
var ServerSocket      = java.net.ServerSocket;
var PrintWriter       = java.io.PrintWriter;
var InputStreamReader = java.io.InputStreamReader;
var BufferedReader    = java.io.BufferedReader;
var FileInputStream   = java.io.FileInputStream;
var ByteArray         = Java.type("byte[]");
var CharArray         = Java.type("char[]");
var StringType        = Java.type("java.lang.String");

//Global vars
var PORT = 8080;
var CRLF = "\r\n";
var FOUROHFOUR = <<<EOD;
<HTML>
    <HEAD>
        <TITLE>404 Not Found</TITLE>
    </HEAD>
    <BODY>
        <P>404 Not Found</P>
    </BODY>
</HTML>
EOD

//Creating server socket
var serverSocket = new ServerSocket(PORT);

//Keeping the server alive
while (true) {
    //waiting for client connections, once it receives one it encapsulates the client
    //socket in the 'socket' js object
    var socket = serverSocket.accept();
    
    try {
	//Once a client establishes connection, creates a thread so the request
	//can be processed concurrently
        var thread = new Thread(function() { httpRequestHandler(socket); });
        thread.start();
        //Not too sure why Jim did this
	Thread.sleep(100);
    } catch (e) {
        print(e);
    }
}

//Function/Class that is instantiated for every request
function httpRequestHandler(socket) {  
    //prepare channel to send data to the client-side
    var out       = socket.getOutputStream();
    var output    = new PrintWriter(out);
    //prepare BufferedReader to read the data that was sent by the client
    var ins = socket.getInputStream();
    var inReader  = new InputStreamReader(ins, 'utf-8');
    var bufReader = new BufferedReader(inReader);

    //Creating array to store the lines of the request
    var lines = [];

    //The first line is going to tell us what's the type of the request
    var firstLine = bufReader.readLine();
    //Let's add the first line to the array of request lines
    lines.push(firstLine);

    //If it's a GET request
    if(firstLine.indexOf("GET") == 0) {
	print(firstLine);
	//keep reading the bufferedReader
	while(true) {
	    var line = bufReader.readLine();
	    //Add the contents of the request to the array
	    lines.push(line);
	    print(line);

	    //if there's an empty line, that's the end of our GET request
	    if(line.length == 0) {
		break;
	    }
	}
    } else if(firstLine.indexOf("POST") == 0) {
	//initialize variable that will keep track of the number of bytes
	//defined in the 'Content-Length' request parameter
	var contentLength = 0;
	print('First line: ' + firstLine);

	//Keep iterating through every line to find the 'Content-Length'
	while(true) {
	    var line = bufReader.readLine();
	    lines.push(line);
	    print('POST: ' + line);

	    var contentLengthStr = "Content-Length: ";
	    if(line.indexOf(contentLengthStr) == 0) {
		//take the Content-Length value
		contentLength = line.substring(contentLengthStr.length);
	    }
	    if(line.length == 0) {
		break;
	    }
	}
	print('Content-Length: ' + contentLength);

	//Initialize array of characters including 2 characters: \r (carriage return) & \n (new line)	
	var content = new CharArray((parseInt(contentLength)+2));
	print('REAL Content length: ' + content.length);

	//Read the bufferedReader within the limit established by the char array
	bufReader.read(content);
	
	//Use the java.lang.String.valueOf() method to convert the char array to String
	var contentStr = StringType.valueOf(content);
	print('contentStr: ' + contentStr);

	lines.push(contentStr);	
    }
    print('first line: ' + lines[0]);
    //Retrieve the first element of the request from the first element in the array (lines[0])
    var header = lines[0].split(/\b\s+/);
    print('header: ' + header);
    //Retrieve the URL (ignoring the parameters) from the second element in the header (header[1])
    var URI = header[1].split(/\?/);
    //build the path based on the URL, append the 'serverpages' folder to the beginning of the path
    var path = String("./serverpages" + URI[0]);

    try {
	//requesting a jjsp
	print('path: ' + path);
        if (path.endsWith(".jjsp")) {
            	    
	    //get the last line of the request, i.e., for POST requests, these are the parameters
	    //passed on the request
	    var params = lines[lines.length-1].split("&");
	    
	    //the load function will run the target JS file against the Nashorn engine
	    //To process the POST parameters, we can use controller.jjsp
	    var body = load(path);
	    
	    //Verify if the controller exists
	    if(typeof Controller == 'function') {
		//instantiate the controller and generate a response containing the parameters
		var controller = new Controller();
		var generatedResponse = controller.processData(params);
		Thread.sleep(30000);
	        respond(output, "HTTP/1.0 200 OK", "text/html", generatedResponse);
		//Just load any other jjsp file
	    } else {
		if (!body) throw "JJSP failed";
		//send the result of the JJSP to the client socket's output stream
		respond(output, "HTTP/1.0 200 OK", "text/html", generatedResponse);
	    }
        } else {
	    //if it's just a regular file (html, css) send the file to the user
            print('Sending file...');
            sendFile(output, out, path);
        }
    } catch (e) {
	print(e);
        respond(output, "HTTP/1.0 404 Not Found", "text/html", FOUROHFOUR);
    }
    //Close all the streams
    output.flush();
    bufReader.close();
    socket.close();
}

//Generate an HTTP response for the browser. Contains the proper header and \r \n 
function respond(output, status, type, body) {
    sendBytes(output, status + CRLF);
    sendBytes(output, "Server: Simple Nashorn HTTP Server" + CRLF);
    sendBytes(output, "Content-type: ${type}" + CRLF);
    sendBytes(output, "Content-Length: ${body.length}" + CRLF);
    sendBytes(output, CRLF);
    sendBytes(output, body);
}

function contentType(path) {
    if (path.endsWith(".htm") ||
        path.endsWith(".html")) {
	return "text/html";
    } else if (path.endsWith(".txt")) {
	return "text/text";
    } else if (path.endsWith(".jpg") ||
               path.endsWith(".jpeg")) {
	return "image/jpeg";
    } else if (path.endsWith(".gif")) {
	return "image/gif";
    } else {
	return "application/octet-stream";
    }
}

function sendBytes(output, line) {
    output.write(String(line));
}

function sendFile(output, out, path) {
    var file = new FileInputStream(path);

    var type = contentType(path);
    sendBytes(output, "HTTP/1.0 200 OK" + CRLF);
    sendBytes(output, "Server: Simple Nashorn HTTP Server" + CRLF);
    sendBytes(output, "Content-type: ${contentType(path)}" + CRLF);
    sendBytes(output, "Content-Length: ${file.available()}" + CRLF);
    sendBytes(output, CRLF);
    output.flush();
    
    var buffer = new ByteArray(1024);
    var bytes = 0;
    
    while ((bytes = file.read(buffer)) != -1) {
        out.write(buffer, 0, bytes);
    }
}