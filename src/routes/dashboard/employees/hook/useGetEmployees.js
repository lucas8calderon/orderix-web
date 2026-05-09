import { useState, useEffect } from 'react';
// import { getEmployees } from '../service/employeesService';
import { mockStorage } from '../utils/mockStorage';

// Use MOCK_STORAGE = true para modo protótipo, false para backend real
const USE_MOCK_STORAGE = true;

export function useGetEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyResult, setEmptyResult] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        const data = await mockStorage.getEmployees();
        setEmployees(data);
        setEmptyResult(data.length === 0);
      } else {
        // Modo produção - usar backend real
        // const response = await getEmployees();
        // setEmployees(response.data);
        // setEmptyResult(response.data.length === 0);
      }
      
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
  }, []);

  return { employees, loading, error, emptyResult, fetchEmployees };
}

