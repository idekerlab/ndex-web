import React, { Component } from 'react'
import './Browser.css'

import Toolbar from './Toolbar'
import Cards from './Cards'
import Table from './Table'

class Browser extends Component {

  constructor() {
    super()
    this.state = {
      view: 'Table',
      sort: 'relevance',
			ascending: 'descending',
		}
    this.handleViewSelect = this.handleViewSelect.bind(this)
    this.handleSortSelect = this.handleSortSelect.bind(this)
  	this.handleToggleAscending = this.handleToggleAscending.bind(this)
	}

	handleToggleAscending(newAscending){
		this.setState({ascending:newAscending})
	}

  handleViewSelect(newView) {
    this.setState({view: newView})
  }

  handleSortSelect(newSort) {
    this.setState({sort: newSort})
  }

  sort(items, ascending) {
		if (this.state.sort !== 'relevance'){
			items.sort((item1, item2) => {
				let a = item1[this.state.sort]
				let b = item2[this.state.sort]
				if (a === b) {
					if (item1._id > item2._id) {
						return -1
					} else {
						return 1
					}
				} else if (a > b) {
					return -1
				} else {
					return 1
				}
			})
			if (ascending === 'ascending')
				items = items.reverse()
		}

    return items
  }


  render() {
    const views = {Cards: Cards, Table: Table}
    const fields = Object.keys(this.props.networks[0] || {})
		if (this.props.searchMode !== 'mine')
			fields.unshift('relevance')
		const View = views[this.state.view]
    const { sort, ascending, view } = this.state
		let items = this.sort(this.props.networks.slice(), ascending)
    return (
      <div>
          <div className="Browser">
            <Toolbar
              views={Object.keys(views)}
              selectedView={view}
              onViewSelect={this.handleViewSelect}

              sorts={fields}
              selectedSort={sort}
              onSortSelect={this.handleSortSelect}

							ascending={ascending}
							toggleAscending={this.handleToggleAscending}

							profileSelected={this.props.profileSelected}
							searchMode={this.props.searchMode}
							handleSearchMode={(m) => {
								let newData = {sort: m === 'mine' ? 'modified' : 'relevance'}
								if (m === 'mine')
									newData['ascending'] = 'descending'
								this.setState(newData)
								this.props.handleSearchMode(m)
								}
							}

						/>
            {items.length ?
            <div className="Browser-view">
              <View items={items} onNetworkDownload={this.props.onNetworkDownload}/>
            </div>
            : <div className="Browser-empty-view">No relevant data</div>}
          </div>
      </div>
    )
  }

}

export default Browser
