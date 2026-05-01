// function App()
// {
//   return "hello world";
// }
// export default App;

// import React from 'react'


import Card from './components/Card.jsx'
const App=()=> 
{
  const name="Abdullah Shahid"
  return (
    <div>
      <div>
        <Card />
      </div>
      <div className="card">
        <h2>Card Title</h2>
      </div>
      <div>
        <p>My name is {name}</p>
      </div>
      {/* {card()} */}
    </div>
  )
}
export default App


    //Fragments which is used to wrap multiple elements without adding an extra node to the DOM. It allows us to return multiple elements from a component without the need for a wrapper element like a div. This can help to keep our DOM clean and avoid unnecessary nesting.
