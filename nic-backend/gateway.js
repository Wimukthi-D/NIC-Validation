const express = require("express");
const app = express();
const PORT = 3001;
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(helmet());
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
