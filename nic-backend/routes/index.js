const express = require("express");
const router = express.Router();
const axios = require("axios");
const registry = require("./registry.json");

// Proxy route handler
router.all("/:apiName/:path", async (req, res) => {
  try {
    // Log request details for debugging
    console.log("Proxy request details:", {
      method: req.method,
      url: registry.services[req.params.apiName]?.url + req.params.path,
      headers: req.headers,
      data: req.body,
    });

    // Check if the service exists in the registry
    if (registry.services[req.params.apiName]) {
      // Make the proxy request
      const response = await axios({
        method: req.method,
        url: registry.services[req.params.apiName].url + req.params.path,
        headers: req.headers,
        data: req.body,
      });

      // Handle 304 Not Modified response
      if (response.status === 304) {
        console.warn("Received 304 Not Modified response");
        res.status(304).send("Not Modified");
        return;
      }

      // Send response back to the client
      res.status(response.status).send(response.data);
      console.log("Response data:", response.data);
    } else {
      // Service not found
      res.status(404).send("Service not found");
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error with the proxy request:", {
      message: error.message,
      stack: error.stack,
      response: error.response
        ? {
            status: error.response.status,
            data: error.response.data,
          }
        : null,
    });

    // Handle 400 Bad Request specifically
    if (error.response && error.response.status === 400) {
      res
        .status(400)
        .send("Bad Request: " + (error.response.data || error.message));
    } else {
      // Send general error response
      res
        .status(error.response ? error.response.status : 500)
        .send(
          error.response
            ? error.response.data
            : error.message || "Internal Server Error"
        );
    }
  }
});

// Global error handler for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Optional: process.exit(1) to shut down the server
});

module.exports = router;
