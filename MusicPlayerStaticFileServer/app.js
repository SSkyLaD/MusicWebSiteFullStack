const express = require('express');
const cors = require("cors");
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

app.use('/', express.static(path.join(__dirname, 'UserData', 'userFile')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
