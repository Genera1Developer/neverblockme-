const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

// Create an Express app
const app = express();

// Serve the HTML interface for the proxy
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Proxy route for handling /url?url=<target-site>
app.get("/url", (req, res, next) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    res
      .status(400)
      .send("Error: Please provide a valid URL using ?url= query parameter.");
    return;
  }

  // Validate and normalize the URL
  let formattedUrl = targetUrl;
  if (
    !formattedUrl.startsWith("http://") &&
    !formattedUrl.startsWith("https://")
  ) {
    formattedUrl = "https://" + formattedUrl;
  }

  // Proxy the request using http-proxy-middleware
  const proxyMiddleware = createProxyMiddleware({
    target: formattedUrl,
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    selfHandleResponse: false,
  });

  proxyMiddleware(req, res, next);
});

// Keep Glitch alive by handling 404 responses for undefined routes
app.use((req, res) => {
  res.status(404).send("404: Not Found. Use / or /url?url=<site> to access.");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
