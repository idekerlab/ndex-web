import React from 'react'
import './Header.css'

const Header = ({title, subtitle}) => (
  <div className="Header">
    <h2 className="Header-title">{title}</h2>
    <p className="Header-subtitle">{subtitle}</p>
  </div>
)

export default Header
