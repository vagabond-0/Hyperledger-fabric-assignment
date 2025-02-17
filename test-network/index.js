const express = require('express');
const app = express();
app.use(express.json());

let assets = [];

app.post('/assets', (req, res) => {
    const asset = req.body;
    assets.push(asset);
    res.status(201).json({ message: 'Asset created successfully', asset });
});

app.get('/assets/:id', (req, res) => {
    const assetId = req.params.id;
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
        res.status(200).json(asset);
    } else {
        res.status(404).json({ message: 'Asset not found' });
    }
});

app.put('/assets/:id', (req, res) => {
    const assetId = req.params.id;
    const updatedAsset = req.body;
    const index = assets.findIndex(a => a.id === assetId);
    if (index !== -1) {
        assets[index] = { ...assets[index], ...updatedAsset };
        res.status(200).json({ message: 'Asset updated successfully', asset: assets[index] });
    } else {
        res.status(404).json({ message: 'Asset not found' });
    }
});

app.delete('/assets/:id', (req, res) => {
    const assetId = req.params.id;
    const index = assets.findIndex(a => a.id === assetId);
    if (index !== -1) {
        assets.splice(index, 1);
        res.status(200).json({ message: 'Asset deleted successfully' });
    } else {
        res.status(404).json({ message: 'Asset not found' });
    }
});


app.get('/assets', (req, res) => {
    res.status(200).json(assets);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
