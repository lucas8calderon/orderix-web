import { useState, useEffect } from 'react';
import { settingsStorage } from '../utils/settingsStorage';

export function useSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsStorage.getSettings();
      setSettings(data);
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
      const updatedSettings = await settingsStorage.updateSettings(newSettings);
      setSettings(updatedSettings);
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
      const updatedSettings = await settingsStorage.updateSetting(key, value);
      setSettings((prev) => ({ ...prev, ...updatedSettings }));
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
      const defaultSettings = await settingsStorage.restoreDefaults();
      setSettings(defaultSettings);
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
    restoreDefaults,
  };
}
