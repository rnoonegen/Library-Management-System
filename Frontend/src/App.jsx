import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Transactions from './pages/Transactions';
import { api } from './api';

export default function App() {
  const [dbMode, setDbMode] = useState('memory');

  useEffect(() => {
    api.getHealth().then((data) => setDbMode(data.dbMode)).catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout dbMode={dbMode} />}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="members" element={<Members />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
