import React from 'react'
import './SearchBar.css'

const WAIT_INTERVAL = 2000
const ENTER_KEY = 13

const exampleTerms = [
        {
          text: 'melanoma',
          description: 'Any mention of melanoma'
        },
        {
          text: 'RBL2',
          description: 'Any mention of RBL2'
        },
        {
          text: 'uuid:2e67e8f0-3a6c-11e7-8f50-0ac135e8bacf',
          description: 'Network by UUID'
        },
        {
          text: 'nodeCount:[11 TO 79]',
          description: 'By a numeric property range, a node count of 11 to 79 nodes'
        },
        {
          text: 'TP53 AND BARD1',
          description: 'A co-occurance of genes'
        },
        {
          text: 'NCI AND edgeCount:[100 TO 300]',
          description: 'Contains the term NCI and has between 100 to 300 edges'

        },
        {
          text: 'creationTime:[2016-01-01T00:00:01Z TO 2016-04-27T23:59:59Z]',
          description: 'Created between 1/1/16 and 4/27/16'
        }
      ]


export const SearchBar = ({term, profileSelected, handleTermChange, handleSearch, searchMode}) => {
  if (term === undefined)
		term = ""
	const handleKeyDown = (e) => {
    if (e.keyCode === ENTER_KEY) {
    	if (this.timer !== undefined) {
      	clearTimeout(this.timer)
    	}
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
	const searchExamples = exampleTerms.map(function(term, k){
		return <li key={k}>
			<a onClick={() => {
				// This is a hack, so click events are handled like key changed events, and queued
				handleChange({target: {value: term.text}})
			}
			}>{term.text}<br />
				<span>{term.description}</span>
			</a>
		</li>;
	})
	const mine = searchMode === 'mine'
	return (
    <div className="Search">
      <input
				className="SearchBar"
        disabled={mine}
				type="text"
        placeholder={mine ? "" : "Enter search terms here..."}
        results="0"
        value={mine ? '' : term}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
			/>
			{term.length === 0 ?
			<ul className="examples">
				{searchExamples}
			</ul>:null}
    </div>
  )
}

export default SearchBar
