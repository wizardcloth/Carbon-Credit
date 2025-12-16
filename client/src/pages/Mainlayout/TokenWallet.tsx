// Client/src/pages/Farmer/TokenWallet.tsx
// UPDATED: Uses Firebase userId from authProvider

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, FileText, Download, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createHeader } from "@/authProvider/authProvider";
import { auth } from "@/lib/firebase";
import axiosInstance from '@/lib/axios';

interface Project {
  _id: string;
  farmerName: string;
  landArea: number;
  verificationStatus: string;
  walletAddress?: string;
  tokenGenerated: boolean;
  transactionHash?: string;
  emissionData?: {
    emission_reduction: {
      carbon_credit_potential_tco2e: number;
    };
  };
  createdAt: string;
}

interface WalletData {
  address: string;
  balance: string;
  totalProjects: number;
  totalCredits: string;
  verifiedProjects: Project[];
}

export default function TokenWallet() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // Get Firebase user ID
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        toast.error('Please login to view wallet');
        setLoading(false);
        return;
      }

      console.log('📋 Fetching wallet for user:', userId);

      const header = await createHeader();
      
      // Updated endpoint: /users/:userId/wallet
      const response = await axiosInstance.get(`/users/${userId}/wallet`, header);
      
      console.log('✓ Wallet response:', response.data);
      
      if (response.data.success) {
        setWalletData(response.data.wallet);
      }
    } catch (error: any) {
      console.error('❌ Failed to load wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadWalletInfo = () => {
    if (!walletData) return;
    
    const data = {
      walletAddress: walletData.address,
      balance: `${walletData.balance} CCT`,
      totalProjects: walletData.totalProjects,
      totalCredits: `${walletData.totalCredits} tCO₂e`,
      exportDate: new Date().toISOString(),
      projects: walletData.verifiedProjects.map(p => ({
        name: p.farmerName,
        landArea: p.landArea,
        credits: p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e,
        transactionHash: p.transactionHash
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-${walletData.address.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Wallet info downloaded');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Wallet className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900">No Wallet Yet</h3>
          <p className="text-gray-600 mb-4">
            Your wallet will be automatically created when your first project is approved by admin.
          </p>
          <p className="text-sm text-gray-500">
            Submit a project and wait for verification to get started!
          </p>
        </div>
      </div>
    );
  }

  const creditValue = parseFloat(walletData.balance) * 50; // $50 per credit

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Token Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your carbon credit tokens</p>
        </div>
        <button
          onClick={downloadWalletInfo}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Wallet
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Balance */}
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80 font-medium">CCT Balance</span>
          </div>
          <div>
            <p className="text-4xl font-bold">{walletData.balance}</p>
            <p className="text-sm opacity-80 mt-1">Carbon Credit Tokens</p>
          </div>
        </div>

        {/* USD Value */}
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80 font-medium">Est. Value</span>
          </div>
          <div>
            <p className="text-4xl font-bold">${creditValue.toFixed(2)}</p>
            <p className="text-sm opacity-80 mt-1">@ $50 per CCT</p>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80 font-medium">Projects</span>
          </div>
          <div>
            <p className="text-4xl font-bold">{walletData.totalProjects}</p>
            <p className="text-sm opacity-80 mt-1">Verified Projects</p>
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Wallet Address</h3>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <code className="flex-1 text-sm font-mono text-gray-700 overflow-x-auto">
            {walletData.address}
          </code>
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
            title="Copy address"
          >
            {copied ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          ⚠️ This is your unique blockchain wallet address. Keep it safe and never share your private key!
        </p>
      </div>

      {/* Verified Projects */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Verified Projects</h3>
        
        {walletData.verifiedProjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No verified projects yet</p>
        ) : (
          <div className="space-y-4">
            {walletData.verifiedProjects.map((project) => (
              <div
                key={project._id}
                className="border border-gray-200 rounded-lg p-5 hover:border-green-500 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{project.farmerName}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Land Area:</span> {project.landArea} hectares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {project.emissionData?.emission_reduction?.carbon_credit_potential_tco2e.toFixed(2)} CCT
                    </p>
                    <p className="text-xs text-gray-500">Tokens Minted</p>
                  </div>
                </div>

                {project.transactionHash && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Transaction Hash:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-blue-600 break-all flex-1">
                        {project.transactionHash}
                      </code>
                      <a
                        href={`https://etherscan.io/tx/${project.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="View on blockchain explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Verified: {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {project.tokenGenerated && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Tokens Generated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-linear-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition-all text-left group">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sell Credits</p>
                <p className="text-sm text-gray-600">List on marketplace</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Transaction History</p>
                <p className="text-sm text-gray-600">View all transactions</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}