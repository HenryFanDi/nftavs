import Install from './components/Install';
import Home from './components/Home';
import './App.css';
import Minter from './components/Minter';

function App() {

  return (
    <div className="App">
      <Minter></Minter>
    </div>
  );

  // if (window.ethereum) {
  //   return <Home />;
  // } else {
  //   return <Install />
  // }
}

export default App;