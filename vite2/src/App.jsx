// function App()
// {
//   return "hello";
// }
// export default App

import React from 'react'
import New from './components/New'
// import Card from './components/Card'

const App = () => {
  const user='abdullah';
  return (
    <div>
      <h1>Our Application is under development. Its a smart home application.</h1>
      <div className="New">
        <h1>Abdullah</h1>
        <h2>{user}</h2>
        <div>
          <New/>
          <New/>

        </div>


        {New()}


      </div>
    </div>
  )
}

export default App
