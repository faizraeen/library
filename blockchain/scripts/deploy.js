/**
 * LibraChain - Smart Contract Deployment Script for Ethereum Sepolia
 *
 * Usage with ethers / Node:
 *   node scripts/deploy.js
 *
 * Requirements in environment:
 *   SEPOLIA_RPC_URL (e.g. Infura / Alchemy / public RPC)
 *   PRIVATE_KEY (deployer wallet private key with Sepolia ETH)
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const contractABI = require('../contracts/LibraryManagementABI.json');

async function main() {
  console.log('======================================================');
  console.log('  LIBRACHAIN - SMART CONTRACT DEPLOYMENT TO SEPOLIA');
  console.log('======================================================');

  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.log('\n[INFO] No PRIVATE_KEY provided in .env');
    console.log('To deploy to Sepolia testnet via this script:');
    console.log('1. Set PRIVATE_KEY=0x... in your .env');
    console.log('2. Ensure your account has Sepolia testnet ETH');
    console.log('3. Run: node blockchain/scripts/deploy.js\n');
    console.log('Alternatively, you can deploy in 60 seconds via Remix IDE:');
    console.log('-> Open https://remix.ethereum.org');
    console.log('-> Paste blockchain/contracts/LibraryManagement.sol');
    console.log('-> Compile with 0.8.24');
    console.log('-> In "Deploy & Run", select "Injected Provider - MetaMask"');
    console.log('-> Click "Deploy" and copy the deployed contract address into client/.env\n');
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Deployer Address: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Account Balance:  ${ethers.formatEther(balance)} SepoliaETH`);

  if (balance === 0n) {
    console.error('ERROR: Deployer account has 0 Sepolia ETH. Please fund via https://sepoliafaucet.com');
    process.exit(1);
  }

  console.log('\nDeploying LibraryManagement.sol...');

  // Note: For full bytecode deployment via script, compile with solc/hardhat
  // Or deploy via Remix IDE and set VITE_CONTRACT_ADDRESS in .env
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
