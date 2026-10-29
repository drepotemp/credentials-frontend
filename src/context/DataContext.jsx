import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastLoad, setLastLoad] = useState(0);

  const loadAll = useCallback(async (force = false) => {
    // Cache for 30 seconds unless forced
    if (!force && Date.now() - lastLoad < 30000 && stats && users.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const [statsData, usersData, adminsData] = await Promise.all([
        api.stats(),
        api.users({ status: 'all' }),
        api.admins()
      ]);

      setStats(statsData);
      setUsers(usersData.users);
      setAdmins(adminsData.admins);
      setError('');
      setLastLoad(Date.now());
    } catch (err) {
      setError(err.message || 'Failed to sync data.');
    } finally {
      setLoading(false);
    }
  }, [lastLoad, stats, users.length]);

  // Initial load
  useEffect(() => {
    loadAll();
  }, []);

  const value = {
    stats,
    users,
    admins,
    loading,
    error,
    refresh: () => loadAll(true),
    updateUserStatus: async (id, status) => {
      await api.updateUser(id, status);
      await loadAll(true);
    },
    deleteUser: async (id) => {
      await api.deleteUser(id);
      await loadAll(true);
    },
    addAdmin: async (identifier) => {
      await api.addAdmin(identifier);
      await loadAll(true);
    },
    removeAdmin: async (id) => {
      await api.removeAdmin(id);
      await loadAll(true);
    }
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
