const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
const DB = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadData() {
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({ qrs: [] }, null, 2));
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

function validUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Create a dynamic QR destination
app.post("/api/qrs", (req, res) => {
  const { name, targetUrl } = req.body;

  if (!name || !targetUrl || !validUrl(targetUrl)) {
    return res.status(400).json({ error: "Inserisci un nome e un URL valido (http/https)." });
  }

  const data = loadData();
  const id = crypto.randomBytes(6).toString("hex");

  const qr = {
    id,
    name: String(name).trim(),
    targetUrl: String(targetUrl).trim(),
    createdAt: new Date().toISOString()
  };

  data.qrs.push(qr);
  saveData(data);
  res.json(qr);
});

// List QRs
app.get("/api/qrs", (req, res) => {
  res.json(loadData().qrs);
});

// Change the destination without changing the QR
app.patch("/api/qrs/:id", (req, res) => {
  const { targetUrl } = req.body;

  if (!targetUrl || !validUrl(targetUrl)) {
    return res.status(400).json({ error: "URL non valido." });
  }

  const data = loadData();
  const qr = data.qrs.find(q => q.id === req.params.id);

  if (!qr) return res.status(404).json({ error: "QR non trovato." });

  qr.targetUrl = String(targetUrl).trim();
  qr.updatedAt = new Date().toISOString();

  saveData(data);
  res.json(qr);
});

// Dynamic redirect: the printed QR points here.
app.get("/q/:id", (req, res) => {
  const data = loadData();
  const qr = data.qrs.find(q => q.id === req.params.id);

  if (!qr) return res.status(404).send("QR non trovato.");

  res.redirect(qr.targetUrl);
});

app.listen(PORT, () => {
  console.log(`QRMenu MVP attivo su http://localhost:${PORT}`);
});