import React from 'react'
import './Toolbar.css'

const Toolbar = ({
  views, selectedView, onViewSelect,
  sorts, selectedSort, onSortSelect,
	ascending, toggleAscending,
	searchMode, handleSearchMode, profileSelected
}) => {
	if (!profileSelected)
		searchMode='all'
  return (
    <div className="Toolbar">
      <ViewButtonCluster
        views={views}
        selectedView={selectedView}
        onViewSelect={onViewSelect}
      />
			<div className='Toolbar-searchMode'>
				<input
					id='searchMode'
					type="checkbox"
					disabled={!profileSelected}
					onChange={(v) => {handleSearchMode(v.target.checked ? 'mine' : 'all') }}
					checked={searchMode === 'mine'}/>
				<label>My Networks</label>
			</div>
      <div className="Toolbar-view-dropdowns">
				<SortSelector
         sorts={sorts}
         sortsFilter={(sort) => sort !== "_id" && sort !== "description"}
         selectedSort={selectedSort}
         onSortSelect={onSortSelect}
       	/>
       	<select disabled={selectedSort === 'relevance'} className="Toolbar-order Toolbar-dropdown" onChange={(v) => {toggleAscending(v.target.value) }} value={ascending}>
					<option value={"ascending"}>Ascending</option>
					<option value={"descending"}>Descending</option>
				</select>
      </div>
    </div>
  )
}

const ViewButtonCluster = ({views, selectedView, onViewSelect}) => (
  <div className="Toolbar-view-buttons">
    {views.map((view, index) =>
      <button
        className={selectedView === view ? "selected": ""}
        key={index}
        onClick={()=>onViewSelect(view)}
        >
          {view}
        </button>)}
  </div>
)

const SortSelector = ({sorts, sortsFilter, selectedSort, onSortSelect}) => (
  <select
    className="Toolbar-sort Toolbar-dropdown"
    value={selectedSort}
    onChange={(event) => onSortSelect(event.target.value)}
  >
    {(sorts.filter(sortsFilter)).map((sort, index) => <option key={index} value={sort}>Sort by {sort}</option>)}
  </select>
)

export default Toolbar
