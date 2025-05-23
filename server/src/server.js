const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const productRoutes = require('./routes/products');
const nomenclatureRoutes = require('./routes/nomenclatures');

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173', // Локальная разработка
      'https://vite-nu-opal.vercel.app', // Замените на ваш URL Vercel
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/nomenclatures', nomenclatureRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));