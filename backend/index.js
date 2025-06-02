const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');
const path = require('path');
const createInvoice = require('./invoice'); // PDF-Funktion
const sendInvoiceEmail = require('./mail');  // Mail-Funktion

dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); // React-Client erlauben
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { cartItems, address } = req.body;

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(parseFloat(item.price.replace(',', '.')) * 100),
    },
    quantity: 1,
  }));

  try {
    // ✅ Stripe Checkout Session erzeugen
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/checkout',
    });

    // ✅ PDF-Rechnung erzeugen
    const total = cartItems
      .map((item) => parseFloat(item.price.replace(',', '.')))
      .reduce((a, b) => a + b, 0)
      .toFixed(2) + ' €';

    const invoiceData = {
      customerAddress: address || 'Adresse unbekannt',
      items: cartItems,
      total,
    };

    const invoicePath = path.join(__dirname, 'rechnung_test.pdf');
    createInvoice(invoiceData, invoicePath);

    // ✅ E-Mail mit PDF versenden
    await sendInvoiceEmail({
      to: process.env.MAIL_TO,
      subject: 'Neue Bestellung – Christbaum-Shop',
      text: `Neue Bestellung von ${address || 'unbekannt'}\nGesamt: ${total}`,
      filePath: invoicePath,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe/Mail error:', error);
    res.status(500).json({ error: 'Ein Fehler ist aufgetreten.' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`🚀 Backend läuft auf http://localhost:${PORT}`));
