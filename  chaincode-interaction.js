const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, 'connection-org1.json');

const walletPath = path.join(__dirname, 'wallet');
const wallet = new FileSystemWallet(walletPath);


async function createAsset(assetID, owner, value) {
    try {
        const gateway = await connectGateway();

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic'); 

        await contract.submitTransaction('createAsset', assetID, owner, value);
        console.log('Asset created successfully');
        
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to create asset: ${error}`);
    }
}

async function readAsset(assetID) {
    try {
        const gateway = await connectGateway();

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic'); 

        const result = await contract.evaluateTransaction('readAsset', assetID);
        console.log(`Asset details: ${result.toString()}`);
        
        await gateway.disconnect();
        return JSON.parse(result.toString());
    } catch (error) {
        console.error(`Failed to read asset: ${error}`);
    }
}


async function updateAsset(assetID, newValue) {
    try {
        const gateway = await connectGateway();

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic'); 

        await contract.submitTransaction('updateAsset', assetID, newValue);
        console.log('Asset updated successfully');
        
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to update asset: ${error}`);
    }
}

async function deleteAsset(assetID) {
    try {
        const gateway = await connectGateway();

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic'); 

        await contract.submitTransaction('deleteAsset', assetID);
        console.log('Asset deleted successfully');
        
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to delete asset: ${error}`);
    }
}

// Helper function to connect to the gateway
async function connectGateway() {
    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
        wallet,
        identity: 'admin', 
        discovery: { enabled: true, asLocalhost: true },
    });
    return gateway;
}

module.exports = {
    createAsset,
    readAsset,
    updateAsset,
    deleteAsset,
};
