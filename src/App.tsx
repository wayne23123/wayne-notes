import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Notes from './pages/Notes';
import Tools from './pages/Tools';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="notes" element={<Notes />} />
        <Route path="tools" element={<Tools />} />
      </Route>
    </Routes>
  );
}

export default App;
