import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [batches, setBatches] = useState([]);
  const [sales,   setSales]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [{ data: b }, { data: s }] = await Promise.all([
      supabase.from('batches').select('*').order('created_at', { ascending: false }),
      supabase.from('sales').select('*').order('created_at',   { ascending: false }),
    ]);
    if (b) setBatches(b);
    if (s) setSales(s);
    setLoading(false);
  };

  const addBatch = async (batch) => {
    const { data, error } = await supabase
      .from('batches')
      .insert([batch])
      .select()
      .single();
    if (error) return { success: false, message: error.message };
    setBatches(prev => [data, ...prev]);
    return { success: true, data };
  };

  const deleteBatch = async (id) => {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);
    if (error) return { success: false, message: error.message };
    setBatches(prev => prev.filter(b => b.id !== id));
    setSales(prev => prev.filter(s => s.batch_id !== id));
    return { success: true };
  };

  const addSale = async (sale) => {
    const { data, error } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();
    if (error) return { success: false, message: error.message };
    setSales(prev => [data, ...prev]);
    return { success: true, data };
  };

  const deleteSale = async (id) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    if (error) return { success: false, message: error.message };
    setSales(prev => prev.filter(s => s.id !== id));
    return { success: true };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0b09] flex items-center
        justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center
            justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">🔥</span>
          </div>
          <p className="text-stone-500 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      batches, sales,
      addBatch, deleteBatch,
      addSale,  deleteSale,
      fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);