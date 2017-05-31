import React from 'react'
import './Waiting.css'

import logo from '../ndex-logo.png'

const Waiting = ({text}) => (
  <div className="Waiting">
    <img src={logo} alt="NDEx Logo" className="Waiting-logo"/>
    <div className="Waiting-spinner"/>
    <h1>{text}</h1>
  </div>
)

export default Waiting
