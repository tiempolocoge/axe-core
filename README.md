Status: ![Build Status](http://builds.dequecloud.com:8088/bamboo/plugins/servlet/buildStatusImage/KSD-INT)

# README #

ks-integration allows integration tests to be run with Mocha and Selenium.

### To run integration tests ###

* One time only: grunt curl
* grunt test

### To write integration tests ###

* In `test/integration/rules` create a full HTML page with your test cases (e.g., `test.html`)
* In that same directory, create a JSON file with the same basename (e.g. `test.json`) with the following properties:
    * `description` - Test name
    * `rule` - The id of the rule you're testing
    * `violations` - An array of selector arrays in the same format that is returned by a11ycheck, for those nodes that are expected to give violations
    * `passes` - The same array of arrays, for those nodes that are expected to pass