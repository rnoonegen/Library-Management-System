import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Books from './pages/Books/Books';
import Members from './pages/Members/Members';
import Transactions from './pages/Transactions/Transactions';
import { useDbMode } from './hooks/useDbMode';

export default function App() {
  const dbMode = useDbMode();

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
