import React from 'react'
// import {BookMark} from 'lucide-react'
// import { FaBookmark } from 'react-icons/fa'
import Card from './components/Card'
import User from './components/User'

const App = () => {

  const arr = [1,2,3,4,5];
  return (
    <div className='parent'>
      {/* <User name={arr[0]}/>
      <User name={arr[1]}/>
      <User name={arr[2]}/>
      <User name={arr[3]}/>
      <User name={arr[4]}/> */}

      {arr.map(function(elem)
      {
        return elem;
      })}
    </div>
  )
}

export default App

