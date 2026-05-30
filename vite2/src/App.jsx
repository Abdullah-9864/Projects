import React from 'react'
import Card from './components/card'
// import New from './components/New'
// import Nav from './components/Nav'

const App = () => {
  return (
    <div className='parent'>
      <Card user="abdullah" age={12}/>
      <Card user="asad" age={13}/>
      {/* <Card/> */}
    

    </div>
  )
}

export default App
