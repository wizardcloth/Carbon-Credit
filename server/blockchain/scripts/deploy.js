// server/blockchain/scripts/deploy.js
// Deployment script for CarbonCreditToken

const hre = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 Deploying CarbonCreditToken Contract");
  console.log("=".repeat(70) + "\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("⏳ Deploying contract...");
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  const token = await CarbonCreditToken.deploy();

  await token.waitForDeployment();

  const address = await token.getAddress();

  console.log("\n" + "=".repeat(70));
  console.log("✅ Contract Deployed Successfully!");
  console.log("=".repeat(70));
  console.log("\n📍 Contract Address:", address);
  console.log("👤 Owner Address:", deployer.address);
  
  // Get contract info
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  
  console.log("\n📊 Token Information:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals);
  
  console.log("\n" + "=".repeat(70));
  console.log("⚙️  Environment Setup");
  console.log("=".repeat(70));
  console.log("\nAdd these to your server/.env file:");
  console.log("-".repeat(70));
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`ADMIN_PRIVATE_KEY=${process.env.ADMIN_PRIVATE_KEY || deployer.privateKey}`);
  console.log(`BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545`);
  console.log("-".repeat(70));
  
  console.log("\n✨ Deployment Complete!");
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });