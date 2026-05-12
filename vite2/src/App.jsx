import React from 'react'
// import {BookMark} from 'lucide-react'
// import { FaBookmark } from 'react-icons/fa'
import Card from './components/Card'
import User from './components/User'

const App = () => {

  const arr = [1,2,3,4,5];
  return (
    <div className='parent'>
      {/* <User name="John Doe" />
      <User name={arr[0]} /> */}
      {arr.map(function()
      {
        return <Card />
      })}


    </div>
  )
}

export default App

