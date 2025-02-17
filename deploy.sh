#!/bin/bash

# Set environment variables
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
export CORE_PEER_TLS_ENABLED=false
export CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999
export CHAINCODE_ID=mycc:1.0

# Package the chaincode
peer lifecycle chaincode package mycc.tar.gz \
    --path /opt/gopath/src/github.com/chaincode \
    --lang golang \
    --label mycc_1.0

# Install the chaincode
peer lifecycle chaincode install mycc.tar.gz

# Get the package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep mycc_1.0 | cut -d' ' -f3 | cut -d',' -f1)

# Approve the chaincode
peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID mychannel \
    --name mycc \
    --version 1.0 \
    --package-id $PACKAGE_ID \
    --sequence 1

# Commit the chaincode
peer lifecycle chaincode commit \
    -o orderer.example.com:7050 \
    --channelID mychannel \
    --name mycc \
    --version 1.0 \
    --sequence 1