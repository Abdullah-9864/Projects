// import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  let counter = 4;
  const addValue = () => {
    console.log(counter);
    // counter= counter +1; 
  };


  return (
    <>
    <h1>hello world</h1>
    <p>counter: {counter}</p>
    <button onClick={addValue}>add value</button>
    <button>remove value</button>
    </>
    
  )
}

export default App
