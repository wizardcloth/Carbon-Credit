// server/blockchain/service/blockchainService.js
// FIXED: Handles nonce issues with transaction delays

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({quiet:true});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class BlockchainService {
  constructor() { 
    this.provider = null;
    this.contract = null;
    this.adminWallet = null;
    this.initialized = false;
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';
    this.rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    this.adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || 
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    this.lastTransactionTime = 0;
    this.transactionDelay = 1500; // 1.5 seconds between transactions
  }

  /**
   * Load contract ABI from artifacts
   */
  loadContractABI() {
    try {
      const abiPath = path.join(__dirname, '../artifacts/contracts/CarbonCreditToken.sol/CarbonCreditToken.json');
      const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      return contractJson.abi;
    } catch (error) {
      console.error('❌ Failed to load contract ABI:', error.message);
      return null;
    }
  }

  /**
   * Wait for safe transaction timing
   */
  async waitForSafeTransaction() {
    const timeSinceLastTx = Date.now() - this.lastTransactionTime;
    if (timeSinceLastTx < this.transactionDelay) {
      const waitTime = this.transactionDelay - timeSinceLastTx;
      console.log(`⏳ Waiting ${waitTime}ms before next transaction...`);
      await delay(waitTime);
    }
    this.lastTransactionTime = Date.now();
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      this.adminWallet = new ethers.Wallet(this.adminPrivateKey, this.provider);
      
      if (this.contractAddress) {
        const abi = this.loadContractABI();
        if (abi) {
          this.contract = new ethers.Contract(
            this.contractAddress,
            abi,
            this.adminWallet
          );
          this.initialized = true;
        }
      }
      
      console.log('✓ Blockchain service initialized');
      console.log(`  Network: ${this.rpcUrl}`);
      console.log(`  Admin: ${this.adminWallet.address}`);
      console.log(`  Contract: ${this.contractAddress || 'Not deployed'}`);
      
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Check if blockchain is available
   */
  async isAvailable() {
    try {
      if (!this.provider) return false;
      await this.provider.getBlockNumber();
      return this.initialized && this.contract !== null;
    } catch {
      return false;
    }
  }

  /**
   * Register farmer on blockchain
   */
  async registerFarmer(farmerData) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const { walletAddress, aadharNumber, farmerName } = farmerData;

      console.log(`📝 Registering farmer: ${farmerName} (${walletAddress})`);
      
      // Wait before transaction
      await this.waitForSafeTransaction();

      const tx = await this.contract.registerFarmer(
        walletAddress,
        aadharNumber,
        farmerName
      );

      console.log(`⏳ Waiting for confirmation...`);
      const receipt = await tx.wait();

      console.log(`✓ Farmer registered: ${receipt.hash}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('❌ Error registering farmer:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register project on blockchain
   * FIXED: Handles decimal precision + nonce delays
   */
  async registerProject(projectData) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const { projectId, farmerAddress, landArea, carbonCredits, dataHash } = projectData;

      console.log(`📝 Registering project: ${projectId}`);
      console.log(`   Land area: ${landArea} ha`);
      console.log(`   Carbon credits: ${carbonCredits} tCO2e`);

      // FIX: Round to 2 decimals to avoid "too many decimals for format" error
      const roundedLandArea = Math.floor(landArea * 100) / 100;
      const roundedCredits = Math.floor(carbonCredits * 100) / 100;

      console.log(`   Adjusted land area: ${roundedLandArea} ha`);
      console.log(`   Adjusted carbon credits: ${roundedCredits} tCO2e`);

      // Convert to blockchain format (2 decimals)
      const landAreaBN = ethers.parseUnits(roundedLandArea.toString(), 2);
      const creditsBN = ethers.parseUnits(roundedCredits.toString(), 2);

      // Wait before transaction to avoid nonce issues
      await this.waitForSafeTransaction();

      const tx = await this.contract.registerProject(
        projectId,
        farmerAddress,
        landAreaBN,
        creditsBN,
        dataHash || ''
      );

      console.log(`⏳ Waiting for confirmation...`);
      const receipt = await tx.wait();

      console.log(`✓ Project registered: ${receipt.hash}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('❌ Error registering project:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify project and mint tokens
   * FIXED: Added nonce delay
   */
  async verifyAndMintTokens(projectId) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      console.log(`🪙 Minting tokens for project: ${projectId}`);

      // Wait before transaction to avoid nonce issues
      await this.waitForSafeTransaction();

      const tx = await this.contract.verifyProjectAndMintTokens(projectId);
      
      console.log(`⏳ Waiting for confirmation...`);
      const receipt = await tx.wait();

      console.log(`✓ Tokens minted: ${receipt.hash}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('❌ Error verifying/minting:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reject project
   */
  async rejectProject(projectId) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      await this.waitForSafeTransaction();

      const tx = await this.contract.rejectProject(projectId);
      const receipt = await tx.wait();

      return { success: true, transactionHash: receipt.hash };
    } catch (error) {
      console.error('❌ Error rejecting project:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get project from blockchain
   */
  async getProject(projectId) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const project = await this.contract.getProject(projectId);

      return {
        success: true,
        project: {
          projectId: project[0],
          farmerAddress: project[1],
          landArea: ethers.formatUnits(project[2], 2),
          carbonCredits: ethers.formatUnits(project[3], 2),
          verifiedAt: Number(project[4]),
          status: Number(project[5]),
          dataHash: project[6],
          tokensMinted: project[7],
        },
      };
    } catch (error) {
      console.error('❌ Error getting project:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get farmer details
   */
  async getFarmer(farmerAddress) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const farmer = await this.contract.getFarmer(farmerAddress);

      return {
        success: true,
        farmer: {
          aadharNumber: farmer[0],
          farmerName: farmer[1],
          totalProjects: Number(farmer[2]),
          totalCredits: ethers.formatUnits(farmer[3], 2),
          balance: ethers.formatUnits(farmer[4], 2),
        },
      };
    } catch (error) {
      console.error('❌ Error getting farmer:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get token balance
   */
  async getBalance(address) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const balance = await this.contract.balanceOf(address);
      return {
        success: true,
        balance: ethers.formatUnits(balance, 2),
      };
    } catch (error) {
      console.error('❌ Error getting balance:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get blockchain statistics
   */
  async getStats() {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const totalProjects = await this.contract.getTotalProjects();
      const totalFarmers = await this.contract.getTotalFarmers();
      const totalSupply = await this.contract.totalSupply();

      return {
        success: true,
        stats: {
          totalProjects: Number(totalProjects),
          totalFarmers: Number(totalFarmers),
          totalTokens: ethers.formatUnits(totalSupply, 2),
        },
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate new wallet for farmer
   */
  generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase,
    };
  }
}

// Singleton export
const blockchainService = new BlockchainService();
export default blockchainService;