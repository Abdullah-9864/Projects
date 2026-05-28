import React from 'react'
import New from './components/New'

const App = () => {
  const user="abdullah"
  return (
    <div>
      <h1>Hello my name is {user}</h1>
      <h1>I am gonna smash you!</h1>
      {New()}

    </div>
  )
}

export default App
