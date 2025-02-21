import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Notes from './pages/Notes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="notes" element={<Notes />} />
      </Route>
    </Routes>
  );
}

export default App;
