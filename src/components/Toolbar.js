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
      <div className="Toolbar-view-dropdowns">
				<select className="Toolbar-searchMode Toolbar-dropdown" disabled={!profileSelected} value={searchMode} onChange={(v) => {handleSearchMode(v.target.value)}}>
					<option value="all">All Networks</option>
					<option value="mine">My Networks</option>
				</select>
				<SortSelector
         sorts={sorts}
         sortsFilter={(sort) => sort !== "_id" && sort !== "description"}
         selectedSort={selectedSort}
         onSortSelect={onSortSelect}
       	/>
       	<select className="Toolbar-order Toolbar-dropdown" onChange={(v) => {toggleAscending(v.target.value === "ascending") }} value={ascending ? "ascending" : "descending"}>
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
