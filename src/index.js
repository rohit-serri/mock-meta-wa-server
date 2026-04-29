const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Graph API Endpoint Mock
app.use(/^\/v\d+\.\d+/, apiRoutes);

// Admin / Dashboard Endpoint Mock
app.use('/admin', adminRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        error: {
            message: `Unsupported get request. Object with ID '${req.originalUrl}' does not exist, cannot be loaded due to missing permissions, or does not support this operation.`,
            type: "GraphMethodException",
            code: 100,
            fbtrace_id: require('uuid').v4().replace(/-/g, '').substring(0, 11).toUpperCase()
        }
    });
});

app.listen(PORT, () => {
    console.log(`Mock Meta WA Server listening on port ${PORT}`);
});
