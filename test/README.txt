Download JsTestDriver-1.3.5.jar first then

1. Start Server: 
	java -jar JsTestDriver-1.3.5.jar --port 9876 --config jsTestDriver.conf --browser "your chrome.exe path"
2. Run tests:
	java -jar JsTestDriver-1.3.5.jar --tests all --config jsTestDriver.conf --reset --testOutput test-output