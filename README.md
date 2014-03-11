Nodebox
=======
A Node.js application for uploading and sharing files securely.

Installation
1. Clone repo
2. $ npm install
3. edit system/config.js to look like this:

var config = {}; config.mongoose = "mongodb://[mongo_user]:[password]@[db-server]/mydb"; module.exports = config;
4. Enjoy!
