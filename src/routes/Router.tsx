import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Blog from '../pages/Blog';
import Notes from '../pages/Notes';
import GitBasics from '../pages/Notes/ToolsCommand/GitBasics';
import JavaScriptJSON from '../pages/Notes/JavaScript/JSON';
import Tools from '../pages/Tools';
import JsonFormatter from '../pages/Tools/JsonFormatter';
import ClampCalculator from '../pages/Tools/ClampCalculator';
import StockDataCovert from '../pages/Tools/StockDataCovert';
import Base64ToSvg from '../pages/Tools/Base64ToSvg';

const AppRoutes = () => {
  return (
    <Router basename="/wayne-notes">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="notes" element={<Notes />}></Route>
          <Route
            path="notes/tools-command/git-basics"
            element={<GitBasics />}
          />
          <Route path="notes/java-script/JSON" element={<JavaScriptJSON />} />
          <Route path="tools" element={<Tools />} />
          <Route path="tools/json-formatter" element={<JsonFormatter />} />
          <Route path="tools/clamp-calculator" element={<ClampCalculator />} />
          <Route path="tools/stock-data-covert" element={<StockDataCovert />} />
          <Route path="tools/base64-svg" element={<Base64ToSvg />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
