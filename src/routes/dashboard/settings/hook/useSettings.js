import { useState, useEffect } from 'react';
import { settingsStorage } from '../utils/settingsStorage';

// Use MOCK_STORAGE = true para modo protótipo, false para backend real
const USE_MOCK_STORAGE = true;

export function useSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        const data = await settingsStorage.getSettings();
        setSettings(data);
      } else {
        // Modo produção - usar backend real
        // const response = await getSettings();
        // setSettings(response.data);
      }
      
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        const updatedSettings = await settingsStorage.updateSettings(newSettings);
        setSettings(updatedSettings);
      } else {
        // Modo produção - usar backend real
        // const response = await updateSettings(newSettings);
        // setSettings(response.data);
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError(err);
      console.error('Error updating settings:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        const updatedSettings = await settingsStorage.updateSetting(key, value);
        setSettings(updatedSettings);
      } else {
        // Modo produção - usar backend real
        // const response = await updateSetting(key, value);
        // setSettings(response.data);
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError(err);
      console.error('Error updating setting:', err);
      return false;
    }
  };

  const restoreDefaults = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        const defaultSettings = await settingsStorage.restoreDefaults();
        setSettings(defaultSettings);
      } else {
        // Modo produção - usar backend real
        // const response = await restoreDefaults();
        // setSettings(response.data);
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError(err);
      console.error('Error restoring defaults:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { 
    settings, 
    loading, 
    error, 
    fetchSettings, 
    updateSettings, 
    updateSetting, 
    restoreDefaults 
  };
}
