const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(express.json());

let qrs = [];

function validUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Create QR
app.post("/api/qrs", (req, res) => {
  const { name, targetUrl } = req.body;

  if (!name || !targetUrl || !validUrl(targetUrl)) {
    return res.status(400).json({
      error: "Inserisci un nome e un URL valido (http/https)."
    });
  }

  const qr = {
    id: crypto.randomBytes(6).toString("hex"),
    name: String(name).trim(),
    targetUrl: String(targetUrl).trim(),
    createdAt: new Date().toISOString()
  };

  qrs.push(qr);

  res.json(qr);
});

// List QR
app.get("/api/qrs", (req, res) => {
  res.json(qrs);
});

// Change destination
app.patch("/api/qrs/:id", (req, res) => {
  const { targetUrl } = req.body;

  if (!targetUrl || !validUrl(targetUrl)) {
    return res.status(400).json({
      error: "URL non valido."
    });
  }

  const qr = qrs.find(q => q.id === req.params.id);

  if (!qr) {
    return res.status(404).json({
      error: "QR non trovato."
    });
  }

  qr.targetUrl = String(targetUrl).trim();
  qr.updatedAt = new Date().toISOString();

  res.json(qr);
});

// Dynamic QR redirect
app.get("/q/:id", (req, res) => {
  const qr = qrs.find(q => q.id === req.params.id);

  if (!qr) {
    return res.status(404).send("QR non trovato.");
  }

  res.redirect(qr.targetUrl);
});

module.exports = app;
