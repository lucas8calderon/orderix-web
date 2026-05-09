import { useState, useEffect, useCallback } from 'react';
import { getTables } from '../service/tablesService';

export const useGetTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [emptyResult, setEmptyResult] = useState(false);

  const fetchTable = useCallback(() => {
  setLoading(true);
  getTables()
    .then(response => {
      console.log("Use Get aqui", response.data)
      setEmptyResult(false);
      setError(false);
      setTables(response.data);
    })
    .catch(error => {
      const errorCode = error.response ? error.response.status : 500;
      if (errorCode === 404) {
        setEmptyResult(true);
      } else {
        setError(true);
      }
      setTables([]);
    })
    .finally(() => setLoading(false));
}, []);

  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  return { tables, loading, error, emptyResult, fetchTable };
};
