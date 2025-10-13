const express = require('express');
const pool = require('./db');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();


const app =  express();
const PORT = process.env.API_PORT || 3000;


app.use(express.json());


app.get('/', (req, res) => {
    res.json({message: 'API funcionando'})
})

app.get('/usuarios', async (req, res) => {
    try{
        const [rows] = await pool.query('SELECT * FROM usuarios');
        res.json(rows);
    } catch(err){
        res.status(500).json({error: "erro ao mostrar usuarios", err})
    }
})

app.post('/usuarios', async (req, res) => {
    const {nome, email, senha} = req.body
     if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'campos vazios' });
    }

    try{
        const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)' ;
        const [result] = await pool.query(query, [nome, email, senha]);
         res.status(201).json({ 
            message: 'usuario adicionado com sucesso!',
            id: result.insertId,
            usuario: {nome, email, senha}
        });
    } catch(err) {
        console.log('erro ao adicionar usuario', err);
        res.status(500).json({error: 'erro interno'});
    }
})

app.post('/login', async (req, res) => {
    const {email, senha} = req.body
    if (!email || !senha) {
        return res.status(400).json({ error: 'campos vazios' });
    }
    try{
        const query = "SELECT * FROM usuarios WHERE email=? AND senha=?";
        const [result] = await pool.query(query, [email, senha]);
        
        const payload = {
            id: result.id,
            email: result.email
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.status(201).json({message: "logado com sucesso", token: token});


    } catch(err) {
        console.log('erro ao logar usuario', err);
        res.status(500).json({error: 'erro interno'});
    }


})

app.listen(PORT, () => {
    console.log(`API rodando na porta: ${PORT}`);
});