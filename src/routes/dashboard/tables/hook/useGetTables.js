import { useState, useEffect, useCallback } from 'react';
import { getTables } from '../service/tablesService';

function sortTablesByNumber(tables) {
  return [...(tables || [])].sort(
    (a, b) => (Number(a?.number) || 0) - (Number(b?.number) || 0)
  );
}

export const useGetTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [emptyResult, setEmptyResult] = useState(false);

  const fetchTable = useCallback(() => {
  setLoading(true);
  getTables()
    .then(response => {
      setEmptyResult(false);
      setError(false);
      setTables(sortTablesByNumber(response.data));
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
