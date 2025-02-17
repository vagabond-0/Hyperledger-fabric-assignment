# Hyperledger Fabric Network Setup and Smart Contract Deployment

## Overview
This project sets up a **Hyperledger Fabric network** with the following components:
- 2 Organizations
- 2 Peers per Organization
- 1 Orderer (Raft Consensus)
- 1 Channel
- Fabric CA for Identity Management

The network is used to deploy a simple asset transfer system using a smart contract (chaincode) written in Go/Node.js. Additionally, a Node.js-based **REST API** is provided for managing assets.

---

## Prerequisites
Before setting up the network, ensure the following tools are installed:
- **Docker**: To run Fabric containers.
- **Docker Compose**: To define and run multi-container Docker applications.
- **Fabric Samples, Binaries, and Docker Images**: Download and install Hyperledger Fabric binaries from [Hyperledger Fabric GitHub](https://github.com/hyperledger/fabric-samples).
- **Node.js & npm**: To develop and run the REST API.
- **Fabric CA**: For identity management.

---

## Setup and Deployment

### 1. Generate Cryptographic Materials Using Fabric CA
1. **Start Fabric CA for both organizations (Org1 and Org2):**
   ```bash
   docker-compose -f ./docker-compose-ca-org1.yaml up
   docker-compose -f ./docker-compose-ca-org2.yaml up
Enroll the admin user for both organizations:

bash
Copy
fabric-ca-client enroll -u http://admin:adminpw@localhost:7054 -M ./crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
fabric-ca-client enroll -u http://admin:adminpw@localhost:8054 -M ./crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
2. Configure Fabric CA and Create Identities
Create identities for the following roles:

Admin: Full access to all operations.

Auditor: Can only view all assets.

Regular User: Can only view and manage their own assets.

3. Define Attribute-Based Access Control (ABAC) Policies
Admin: Can create, update, and delete assets.

Auditor: Can only view all assets.

Regular User: Can only view and update their own assets.

4. Set Up and Launch the Fabric Network
Clone the Hyperledger Fabric samples:

bash
Copy
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples/test-network
Start the Fabric network:

bash
Copy
./network.sh up createChannel -c mychannel -s couchdb
Verify the network:

bash
Copy
docker ps
Create the channel:

bash
Copy
./network.sh createChannel -c mychannel
5. Create and Deploy the Chaincode (Smart Contract)
Package and install the chaincode:

bash
Copy
peer lifecycle chaincode package asset-transfer.tar.gz --path ./chaincode/asset-transfer --lang node --label asset-transfer_1
peer lifecycle chaincode install asset-transfer.tar.gz
Approve and commit the chaincode:

bash
Copy
peer lifecycle chaincode approveformyorg --channelID mychannel --name asset-transfer --version 1 --sequence 1 --signature-policy "AND('Org1MSP.peer','Org2MSP.peer')" --init-required
peer lifecycle chaincode commit -o localhost:7050 --channelID mychannel --name asset-transfer --version 1 --sequence 1
6. Invoke and Query the Chaincode
Invoke Chaincode (create asset):

bash
Copy
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n asset-transfer -c '{"function":"CreateAsset","Args":["asset1", "Alice", "1000"]}'
Query Chaincode (read asset):

bash
Copy
peer chaincode query -C mychannel -n asset-transfer -c '{"function":"ReadAsset","Args":["asset1"]}'
7. Develop the REST API in Node.js
Install dependencies:

bash
Copy
npm install fabric-network express body-parser
Create chaincode-interaction.js to interact with the chaincode:

javascript
Copy
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

// Path to connection profile
const ccpPath = path.resolve(__dirname, 'connection-org1.json');
const wallet = new FileSystemWallet('./wallet');

// Create asset
async function createAsset(assetID, owner, value) {
    const gateway = await connectGateway();
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('asset-transfer');
    await contract.submitTransaction('CreateAsset', assetID, owner, value);
    console.log('Asset created');
    await gateway.disconnect();
}

// Connect to Fabric gateway
async function connectGateway() {
    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true },
    });
    return gateway;
}

module.exports = { createAsset };
Define API Endpoints:

javascript
Copy
const express = require('express');
const bodyParser = require('body-parser');
const { createAsset, readAsset, updateAsset, deleteAsset } = require('./chaincode-interaction');

const app = express();
app.use(bodyParser.json());

app.post('/assets', async (req, res) => {
    const { assetID, owner, value } = req.body;
    await createAsset(assetID, owner, value);
    res.send('Asset created');
});

app.get('/assets/:id', async (req, res) => {
    const asset = await readAsset(req.params.id);
    res.send(asset);
});

app.put('/assets/:id', async (req, res) => {
    const { newValue } = req.body;
    await updateAsset(req.params.id, newValue);
    res.send('Asset updated');
});

app.delete('/assets/:id', async (req, res) => {
    await deleteAsset(req.params.id);
    res.send('Asset deleted');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
8. Test the API Endpoints
POST /assets: Create an asset.

GET /assets/{id}: Read asset details.

PUT /assets/{id}: Update an asset.

DELETE /assets/{id}: Delete an asset.

Conclusion
You have successfully set up a Hyperledger Fabric network, deployed a smart contract, and created a REST API to manage assets. The network enforces attribute-based access control (ABAC) policies, and the REST API allows interaction with the blockchain for asset management.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgments
Hyperledger Fabric Documentation

Fabric Samples GitHub

Copy

---

### Notes:
- **Headings**: Clear section titles are used for easy navigation.
- **Code Blocks**: Commands and code snippets are formatted for readability.
- **Organization**: Tasks are broken into logical steps with clear instructions.

Feel free to adjust or add any additional information as needed! Let me know if you need further assistance.
