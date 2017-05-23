import React from 'react'
import './SearchBar.css'

export const SearchBar = ({searchterm, exampleTerms, onSearchtermChange}) => (
  <div className="Search">
    <input
      className="SearchBar"
      type="text"
      placeholder="Enter search terms here..."
      results="0"
      value={searchterm}
      onChange={(event) => onSearchtermChange(event.target.value)}
    />
    <SearchDropdown
      exampleTerms={exampleTerms}
      onSearchtermChange={onSearchtermChange}
    />
  </div>
)

const SearchDropdown = ({exampleTerms, onSearchtermChange}) => (
  <div className="SearchBar-dropdown">
    <h5 className="SearchBar-dropdown-list-title">Sample Queries</h5>
    <ul className="SearchBar-dropdown-list">
    {exampleTerms.map((example) => (
      <li
        className="SearchBar-dropdown-list-item"
        onMouseDown={() => onSearchtermChange(example.text)}
      >
        <h6 className="SearchBar-dropdown-list-text">{example.text}</h6>
        <p className="SearchBar-dropdown-list-subtext">{example.description}</p>
      </li>
    ))}
    </ul>
  </div>
)

export default SearchBar
