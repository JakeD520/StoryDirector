
import SceneComposer from './views/root/SceneComposer';
import { GlobalStateProvider } from './views/root/GlobalStateContext';


export default function App() {
  return (
    <GlobalStateProvider>
      <SceneComposer />
    </GlobalStateProvider>
  );
}
