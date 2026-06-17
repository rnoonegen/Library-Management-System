import { useEffect, useState } from 'react';
import { api } from 'services/api';

export function useDbMode() {
  const [dbMode, setDbMode] = useState('online');

  useEffect(() => {
    api.getHealth().then((data) => setDbMode(data.dbMode)).catch(() => {});
  }, []);

  return dbMode;
}

