import React from 'react'
import './Navbar.css'

import logo from '../ndex-logo.png'

const Navbar = ({children}) => (
  <div className="Navbar">
   <img src={logo} alt="NDEx Logo" className="Navbar-logo"/>
   {children}
  </div>
)

export default Navbar
