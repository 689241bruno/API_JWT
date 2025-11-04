const express = require("express");
const pool = require("./db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando" });
});

app.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "erro ao mostrar usuarios", err });
  }
});

app.post("/usuarios", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ error: "campos vazios" });
  }
  const tiposPermitidos = ["aluno", "professor", "admin"];
  if (!tiposPermitidos.includes(tipo)) {
    return res.status(400).json({ error: "Tipo de usuário inválido." });
  }

  try {
    const query =
      "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(query, [nome, email, senha, tipo]);
    res.status(201).json({
      message: "usuario adicionado com sucesso!",
      id: result.insertId,
      usuario: { nome, email, senha, tipo },
    });
  } catch (err) {
    console.log("erro ao adicionar usuario", err);
    res.status(500).json({ error: "erro interno" });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha, lembrar } = req.body;
  console.log("-> dados de Login", { email, senha, lembrar });
  if (!email || !senha) {
    return res.status(400).json({ error: "campos vazios" });
  }

  try {
    const query = "SELECT * FROM usuarios WHERE email=? AND senha=?";
    const [result] = await pool.query(query, [email, senha]);

    const user = result[0];
    if (result.length === 0) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const expire = lembrar ? "30d" : "7d";

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expire,
    });

    res.status(201).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      token: token,
      lembrar: req.body.lembrar,
      tipo: user.tipo,
    });
  } catch (err) {
    console.log("erro ao logar usuario", err);
    res.status(500).json({ error: "erro interno" });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta: ${PORT}`);
});
