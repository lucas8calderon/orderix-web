import { useState, useEffect } from 'react';
import { getEmployees } from '../service/employeesService';
import { getCurrentUser } from '../../../../services/session';

export function useGetEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyResult, setEmptyResult] = useState(false);
  const storeId = getCurrentUser()?.storeId;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      const data = response.data || [];
      setEmployees(data);
      setEmptyResult(data.length === 0);
      setError(null);
    } catch (err) {
      setError(err);
      setEmptyResult(true);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [storeId]);

  return { employees, loading, error, emptyResult, fetchEmployees };
}
