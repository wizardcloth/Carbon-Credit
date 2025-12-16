
import { Router } from "express";
import User from "../Model/User.js";
import blockchainService from '../blockchain/service/blockchainService.mjs';

const router = Router();

/**
 * GET /api/users/:userId/wallet
 * Get user's wallet information and token balance using Firebase userId
 */
router.get('/:userId/wallet', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📋 Fetching wallet for user: ${userId}`);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Get verified projects with wallet addresses
    const verifiedProjects = user.projects.filter(
      p => p.verificationStatus === 'verified' && p.walletAddress
    );

    console.log(`✓ Found ${verifiedProjects.length} verified projects with wallets`);

    // If no verified projects, user doesn't have a wallet yet
    if (verifiedProjects.length === 0) {
      return res.json({ 
        success: true, 
        wallet: null,
        message: 'No wallet created yet. Get your first project approved!' 
      });
    }

    // Use the first project's wallet address (all should be the same)
    const walletAddress = verifiedProjects[0].walletAddress;

    try {
      // Check if blockchain is available
      const isAvailable = await blockchainService.isAvailable();
      
      if (!isAvailable) {
        console.log('⚠️ Blockchain not available, returning database data');
        
        // Return database data if blockchain unavailable
        return res.json({
          success: true,
          wallet: {
            address: walletAddress,
            balance: '0.00',
            totalProjects: verifiedProjects.length,
            totalCredits: '0.00',
            verifiedProjects,
            blockchainAvailable: false
          }
        });
      }

      console.log('✓ Blockchain available, fetching on-chain data');

      // Get balance from blockchain
      const balanceResult = await blockchainService.getBalance(walletAddress);
      
      // Get farmer details from blockchain
      const farmerResult = await blockchainService.getFarmer(walletAddress);

      console.log(`✓ Balance: ${balanceResult.balance} CCT`);

      res.json({
        success: true,
        wallet: {
          address: walletAddress,
          balance: balanceResult.balance || '0.00',
          totalProjects: farmerResult.farmer?.totalProjects || verifiedProjects.length,
          totalCredits: farmerResult.farmer?.totalCredits || '0.00',
          verifiedProjects,
          blockchainAvailable: true
        }
      });
    } catch (blockchainError) {
      console.error('❌ Blockchain error:', blockchainError.message);
      
      // Fallback to database data if blockchain fails
      res.json({
        success: true,
        wallet: {
          address: walletAddress,
          balance: '0.00',
          totalProjects: verifiedProjects.length,
          totalCredits: '0.00',
          verifiedProjects,
          blockchainAvailable: false
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching wallet:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/users/:userId/projects
 * Get all user's projects with their statuses
 */
router.get('/:userId/projects', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      projects: user.projects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;