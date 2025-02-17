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
