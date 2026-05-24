const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const OMNICASH_API_URL = 'https://omnicash.com.br/api/v1';
const API_KEY = process.env.OMNICASH_API_KEY;

// Rota para criar transação Pix
app.post('/api/create-pix', async (req, res) => {
    try {
        const { name, email, phone, cpf, amount, productName } = req.body;

        const response = await axios.post(`${OMNICASH_API_URL}/transactions`, {
            customer: {
                name,
                email,
                phone,
                cpf
            },
            amount: parseInt(amount), // em centavos
            paymentMethod: 'pix',
            items: [
                {
                    name: productName || 'Produto Checkout',
                    quantity: 1,
                    unitPrice: parseInt(amount)
                }
            ],
            externalId: `order_${Date.now()}`
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Erro ao criar Pix:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response ? error.response.data : 'Erro interno no servidor' 
        });
    }
});

// Rota para consultar status da transação
app.get('/api/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${OMNICASH_API_URL}/transactions/${id}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao consultar status:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: 'Erro ao consultar status' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
