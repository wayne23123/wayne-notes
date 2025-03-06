import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Blog from '../pages/Blog';
import Notes from '../pages/Notes';
import GitBasics from '../pages/notes/git/GitBasics';
import Tools from '../pages/Tools';
import Base64ToSvg from '../pages/tools/Base64ToSvg';

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
          <Route path="tools/base64-svg" element={<Base64ToSvg />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
