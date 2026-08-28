const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

async function supabaseRequest(endpoint, options = {}) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${endpoint}`,
    {
      ...options,
    headers: {
  "apikey": SUPABASE_KEY,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
  ...(options.headers || {})
}
    }
  );

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : JSON.stringify(data)
    );
  }

  return data;
}

function validUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}


/* HOMEPAGE */

app.get("/", (req, res) => {
  res.sendFile(
    require("path").join(
      process.cwd(),
      "public",
      "index.html"
    )
  );
});


/* CREA QR */

app.post("/api/qrs", async (req, res) => {

  try {

    const { name, targetUrl } = req.body;

    if (
      !name ||
      !targetUrl ||
      !validUrl(targetUrl)
    ) {
      return res.status(400).json({
        error:
          "Inserisci un nome e un URL valido."
      });
    }

    const qr = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      target_url: String(targetUrl).trim()
    };

    const result = await supabaseRequest(
      "qrs",
      {
        method: "POST",
        body: JSON.stringify(qr)
      }
    );

    res.json(result[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Errore durante la creazione del QR."
    });

  }

});


/* LISTA QR */

app.get("/api/qrs", async (req, res) => {

  try {

    const result =
      await supabaseRequest(
        "qrs?select=*&order=created_at.desc"
      );

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Errore durante il caricamento dei QR."
    });

  }

});


/* CAMBIA LINK */

app.patch("/api/qrs/:id", async (req, res) => {

  try {

    const { targetUrl } = req.body;

    if (
      !targetUrl ||
      !validUrl(targetUrl)
    ) {
      return res.status(400).json({
        error: "URL non valido."
      });
    }

    const result =
      await supabaseRequest(
        `qrs?id=eq.${encodeURIComponent(req.params.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            target_url: String(targetUrl).trim(),
            updated_at: new Date().toISOString()
          })
        }
      );

    if (!result.length) {
      return res.status(404).json({
        error: "QR non trovato."
      });
    }

    res.json(result[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Errore durante l'aggiornamento."
    });

  }

});


/* QR DINAMICO */

app.get("/q/:id", async (req, res) => {

  try {

    const result =
      await supabaseRequest(
        `qrs?id=eq.${encodeURIComponent(req.params.id)}&select=target_url`
      );

    if (!result.length) {
      return res.status(404).send(
        "QR non trovato."
      );
    }

    res.redirect(result[0].target_url);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Errore del server."
    );

  }

});


module.exports = app;
