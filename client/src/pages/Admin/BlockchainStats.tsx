// Client/src/pages/Admin/BlockchainStats.tsx
// Complete Admin Blockchain Statistics Dashboard

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Users, FileText, Activity, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createHeader } from '@/authProvider/authProvider';
import axiosInstance from '@/lib/axios';

interface BlockchainStats {
  totalProjects: number;
  totalFarmers: number;
  totalTokens: string;
}

interface FarmerBalance {
  address: string;
  farmerName: string;
  balance: string;
  totalCredits: string;
  projectCount: number;
  blockchainAvailable: boolean;
}

interface Transaction {
  transactionHash: string;
  farmerName: string;
  walletAddress: string;
  carbonCredits: number;
  verifiedAt: string;
}

export default function BlockchainStats() {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [farmers, setFarmers] = useState<FarmerBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blockchainAvailable, setBlockchainAvailable] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchBlockchainStats(),
      fetchFarmersBalances(),
      fetchTransactions()
    ]);
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const fetchBlockchainStats = async () => {
    try {
      
      const header = await createHeader();
      const response = await axiosInstance.get('/admin/blockchain/stats', 
        header
      );
      
      if (response.data.available) {
        setStats(response.data.stats);
        setBlockchainAvailable(true);
      } else {
        setBlockchainAvailable(false);
      }
    } catch (error) {
      console.error('Failed to fetch blockchain stats', error);
      setBlockchainAvailable(false);
    }
  };

  const fetchFarmersBalances = async () => {
    try {
      const header = await createHeader();
      const response = await axiosInstance.get('/admin/farmers/balances', 
        header
      );
      setFarmers(response.data.farmers || []);
    } catch (error) {
      console.error('Failed to fetch farmers balances', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const header = await createHeader();
      const response = await axiosInstance.get('/admin/blockchain/transactions', 
        header
      );
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Statistics</h1>
          <p className="text-gray-600 mt-1">Monitor blockchain activity and token distribution</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Blockchain Status Alert */}
      {!blockchainAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <Activity className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">Blockchain Offline</p>
            <p className="text-sm text-yellow-700">
              Showing cached data. Start blockchain node to see real-time data.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Farmers */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <div className={`w-2 h-2 rounded-full ${blockchainAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalFarmers}</p>
            <p className="text-sm text-gray-600 mt-1">Total Farmers on Chain</p>
          </div>

          {/* Total Projects */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
              <div className={`w-2 h-2 rounded-full ${blockchainAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
            <p className="text-sm text-gray-600 mt-1">Projects Registered</p>
          </div>

          {/* Total Tokens */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-green-600" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTokens}</p>
            <p className="text-sm text-gray-600 mt-1">CCT Tokens Minted</p>
          </div>
        </div>
      )}

      {/* Farmers Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Farmer Wallets</h2>
          <p className="text-sm text-gray-600 mt-1">All farmers with verified projects and token balances</p>
        </div>
        
        {farmers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No farmers with verified projects yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {farmers.map((farmer, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{farmer.farmerName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {farmer.address.slice(0, 10)}...{farmer.address.slice(-8)}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-600 font-semibold text-lg">
                        {farmer.balance} CCT
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {farmer.projectCount} projects
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">
                        {farmer.totalCredits} tCO₂e
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {farmer.blockchainAvailable ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          On-chain
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          Cached
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <p className="text-sm text-gray-600 mt-1">Latest token minting transactions</p>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens Minted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Hash
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {transactions.slice(0, 10).map((tx, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(tx.verifiedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{tx.farmerName}</div>
                      <div className="text-xs text-gray-500">
                        {tx.walletAddress.slice(0, 10)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-600 font-semibold">
                        +{tx.carbonCredits.toFixed(2)} CCT
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-blue-600">
                        {tx.transactionHash.slice(0, 20)}...
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}