import React from 'react'
import './Dropdown.css'

const Dropdown = ({title, content, actions}) => (
  <div className="Dropdown">
    <DropdownContent>
      <DropdownTitle title={title}/>
      <DropdownContent>
        {content}
      </DropdownContent>
      <DropdownActions>
        {actions}
      </DropdownActions>
    </DropdownContent> </div>
)

const DropdownTitle = ({title}) => (
  <h5 className="ProfileDropdown-title">{title}</h5>
)

const DropdownContent = ({children}) => (
  <div className="ProfileDropdown-content">
    {children}
  </div>
)

const DropdownActions = ({children}) => (
  <div className="ProfileDropdown-actions">
    {children}
  </div>
)

export const DropdownAction = ({label, onClick}) => (
  <button key={label} onClick={onClick}>{label}</button>
)

export default Dropdown
