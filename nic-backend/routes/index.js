const express = require("express");
const router = express.Router();
const axios = require("axios");
const registry = require("./registry.json");

router.all("/:apiName/:path", (req, res) => {
  if (registry.services[req.params.apiName]) {
    axios({
      method: req.method,
      url: registry.services[req.params.apiName].url + req.params.path,
      Headers: req.headers,
      data: req.body,
    }).then((response) => {
      res.send(response.data);
      console.log(response.data);
    });
  } else {
    res.status(404).send("Service not found");
  }
});

module.exports = router;
