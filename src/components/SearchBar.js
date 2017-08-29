import React from 'react'
import './SearchBar.css'

const WAIT_INTERVAL = 1000
const ENTER_KEY = 13

export const SearchBar = ({term, examples, handleTermChange, handleSearch}) => {
  if (term === undefined)
		term = ""
	const handleKeyDown = (e) => {
    if (e.keyCode === ENTER_KEY) {
      handleSearch(e.target.value)
    }
  }
  const handleChange = (e) => {
    const value = e.target.value
    if (this.timer !== undefined) {
      clearTimeout(this.timer)
    }
    handleTermChange(value)
    this.timer = setTimeout((() => {
      handleSearch(value)
    }), WAIT_INTERVAL)
  }
  return (
    <div className="Search">
      <input
        className="SearchBar"
        type="text"
        placeholder="Enter search terms here..."
        results="0"
        value={term}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {term.length === 0 ?
      <SearchDropdown
        exampleTerms={examples}
        onSearchtermChange={(term) => {
          if (this.timer !== undefined) {
            clearTimeout(this.timer)
          }
          handleTermChange(term)
          handleSearch(term)
        }}
      />: null }
    </div>
  )
}

const SearchDropdown = ({exampleTerms, onSearchtermChange}) => (
  <div className="SearchBar-dropdown">
    <h5 className="SearchBar-dropdown-list-title">Sample Queries</h5>
    <ul className="SearchBar-dropdown-list">
    {exampleTerms.map((example, k) => (
      <li
				key={k}
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
