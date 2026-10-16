const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = require('@phonepe-pg/pg-sdk-node');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// PhonePe V2 Credentials from your Dashboard
const clientId = 'SU2609091632112139659497';
const clientSecret = 'fc29c836-5564-447d-990b-e8aa0009d764';
const clientVersion = 1;
const env = Env.PRODUCTION; // Live environment

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

app.post('/create-payment', async (req, res) => {
    try {
        const { amount, planName } = req.body;
        
        // Generate a unique transaction order ID
        const merchantOrderId = 'TXN' + Date.now();
        
        // Update this URL when you deploy the site to a live domain
        const redirectUrl = 'http://localhost:3000/success';

        // Prepare the standard checkout request
        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amount * 100) // PhonePe expects amount in paise (1 INR = 100 paise)
            .redirectUrl(redirectUrl)
            .build();
        
        // Call PhonePe V2 API
        const response = await client.pay(request);
        
        if (response.redirectUrl) {
            res.json({ url: response.redirectUrl });
        } else {
            res.status(400).json({ error: 'Failed to initiate payment', details: response });
        }
    } catch (error) {
        console.error("PhonePe V2 Error:", error.message || error);
        res.status(500).json({ 
            error: 'Payment Gateway Error', 
            details: error.message || 'An unknown error occurred.' 
        });
    }
});

app.get('/success', (req, res) => {
    res.send('<h2>Payment Successful!</h2><p>You can close this window and return to the AstroVinod app.</p>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with PhonePe V2 Production config`);
});
