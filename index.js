const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/crawler", (req, res) => {
  res.status(200).json({ message: "Crawler" });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
