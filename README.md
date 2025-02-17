# Hyperledger Fabric Network Setup and Smart Contract Deployment

## Overview
This project sets up a **Hyperledger Fabric network** with the following components:

- **2 Organizations**
- **2 Peers per Organization**
- **1 Orderer (Raft Consensus)**
- **1 Channel**
- **Fabric CA for Identity Management**

The network is used to deploy a simple asset transfer system using a smart contract (chaincode) written in **Go/Node.js**. Additionally, a **Node.js-based REST API** is provided for managing assets.

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
   docker-compose -f ./docker-compose-ca-org1.yaml up -d
   docker-compose -f ./docker-compose-ca-org2.yaml up -d
   ```
2. **Enroll the admin user for both organizations:**
   ```bash
   fabric-ca-client enroll -u http://admin:adminpw@localhost:7054 -M ./crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
   fabric-ca-client enroll -u http://admin:adminpw@localhost:8054 -M ./crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
   ```
3. **Configure Fabric CA and create identities for the following roles:**
   - **Admin**: Full access to all operations.
   - **Auditor**: Can only view all assets.
   - **Regular User**: Can only view and manage their own assets.

4. **Define Attribute-Based Access Control (ABAC) Policies:**
   - **Admin**: Can create, update, and delete assets.
   - **Auditor**: Can only view all assets.
   - **Regular User**: Can only view and update their own assets.

### 2. Set Up and Launch the Fabric Network

1. **Clone the Hyperledger Fabric samples:**
   ```bash
   git clone https://github.com/hyperledger/fabric-samples.git
   cd fabric-samples/test-network
   ```
2. **Start the Fabric network:**
   ```bash
   ./network.sh up createChannel -c mychannel -s couchdb
   ```
3. **Verify the network:**
   ```bash
   docker ps
   ```
4. **Create the channel:**
   ```bash
   ./network.sh createChannel -c mychannel
   ```

### 3. Create and Deploy the Chaincode (Smart Contract)

1. **Package and install the chaincode:**
   ```bash
   peer lifecycle chaincode package asset-transfer.tar.gz --path ./chaincode/asset-transfer --lang node --label asset-transfer_1
   peer lifecycle chaincode install asset-transfer.tar.gz
   ```
2. **Approve and commit the chaincode:**
   ```bash
   peer lifecycle chaincode approveformyorg --channelID mychannel --name asset-transfer --version 1 --sequence 1 --signature-policy "AND('Org1MSP.peer','Org2MSP.peer')" --init-required
   peer lifecycle chaincode commit -o localhost:7050 --channelID mychannel --name asset-transfer --version 1 --sequence 1
   ```

### 4. Invoke and Query the Chaincode

- **Invoke Chaincode (create asset):**
  ```bash
  peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n asset-transfer -c '{"function":"CreateAsset","Args":["asset1", "Alice", "1000"]}'
  ```
- **Query Chaincode (read asset):**
  ```bash
  peer chaincode query -C mychannel -n asset-transfer -c '{"function":"ReadAsset","Args":["asset1"]}'
  ```

### 5. Develop the REST API in Node.js

1. **Install dependencies:**
   ```bash
   npm install fabric-network express body-parser
   ```
2. **Create `chaincode-interaction.js` to interact with the chaincode:**
   ```javascript
   const { Gateway } = require('fabric-network');
   const path = require('path');
   const ccpPath = path.resolve(__dirname, 'connection-org1.json');
   
   async function createAsset(assetID, owner, value) {
       const gateway = new Gateway();
       await gateway.connect(ccpPath, { identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
       const network = await gateway.getNetwork('mychannel');
       const contract = network.getContract('asset-transfer');
       await contract.submitTransaction('CreateAsset', assetID, owner, value);
       console.log('Asset created');
       await gateway.disconnect();
   }
   
   module.exports = { createAsset };
   ```
3. **Define API Endpoints (`server.js`):**
   ```javascript
   const express = require('express');
   const bodyParser = require('body-parser');
   const { createAsset } = require('./chaincode-interaction');
   
   const app = express();
   app.use(bodyParser.json());
   
   app.post('/assets', async (req, res) => {
       const { assetID, owner, value } = req.body;
       await createAsset(assetID, owner, value);
       res.send('Asset created');
   });
   
   app.listen(3000, () => {
       console.log('Server running on port 3000');
   });
   ```

### 6. Test the API Endpoints

- **POST `/assets`**: Create an asset.
- **GET `/assets/{id}`**: Read asset details.
- **PUT `/assets/{id}`**: Update an asset.
- **DELETE `/assets/{id}`**: Delete an asset.

---

## Conclusion
You have successfully set up a **Hyperledger Fabric network**, deployed a **smart contract**, and created a **REST API** to manage assets. The network enforces **attribute-based access control (ABAC) policies**, and the REST API allows interaction with the blockchain for asset management.

## License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.

## Acknowledgments
- **Hyperledger Fabric Documentation**
- **Fabric Samples GitHub**
