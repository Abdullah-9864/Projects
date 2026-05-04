// import React from 'react'

const Card = (props) => {
    // console.log(props);
  return (
    <div>
        <div className="card">
        <img src={props.img} alt="image" />
        <h1>{props.user}</h1>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        <button>view profile</button>
        </div>
      
    </div>
  )
}

export default Card
