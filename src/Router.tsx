import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Notes from './pages/Notes';
import Tools from './pages/Tools';
import GitBasics from './pages/notes/git/GitBasics';

const AppRoutes = () => {
  return (
    <Router basename="/wayne-notes">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="notes" element={<Notes />}></Route>
          <Route path="notes/git-basics" element={<GitBasics />} />
          <Route path="tools" element={<Tools />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
