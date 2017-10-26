import React from 'react'
import './Toolbar.css'

const Toolbar = ({
  views, selectedView, onViewSelect,
  sorts, selectedSort, onSortSelect,
	ascending, toggleAscending,
	filter, onFilterChange,
}) => {
  return (
    <div className="Toolbar">
      <ViewButtonCluster
        views={views}
        selectedView={selectedView}
        onViewSelect={onViewSelect}
      />
      <div>
        <SortSelector
          sorts={sorts}
          sortsFilter={(sort) => sort !== "_id" && sort !== "description"}
          selectedSort={selectedSort}
          onSortSelect={onSortSelect}
        />
        <select className="Toolbar-order" onChange={(v) => { console.log(ascending); toggleAscending(v.target.value) }} value={ascending}>
					<option value={true}>Ascending</option>
					<option value={false}>Descending</option>
				</select>
				<FilterField
          filter={filter}
          onFilterChange={onFilterChange}
        />
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
    className="Toolbar-sort"
    value={selectedSort}
    onChange={(event) => onSortSelect(event.target.value)}
  >
    {(sorts.filter(sortsFilter)).map((sort, index) => <option key={index} value={sort}>Sort by {sort}</option>)}
  </select>
)

const FilterField = ({filter, onFilterChange}) => (
  <input
    className="Toolbar-filter"
    type="text"
    placeholder="Enter filter..."
    value={filter}
    onChange={(event) => onFilterChange(event.target.value)}
  />
)

export default Toolbar
