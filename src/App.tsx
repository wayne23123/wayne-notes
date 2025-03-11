import AppRoutes from './routes/Router';
import { DarkModeProvider } from './context/DarkModeContext';

function App() {
  return (
    <DarkModeProvider>
      <AppRoutes />
    </DarkModeProvider>
  );
}

export default App;
