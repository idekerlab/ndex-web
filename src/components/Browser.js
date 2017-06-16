import React, { Component } from 'react'
import './Browser.css'

import Toolbar from './Toolbar'
import Cards from './Cards'
import Table from './Table'

class Browser extends Component {

  constructor() {
    super()
    this.state = {
      view: 'Cards',
      sort: 'name',
      filter: '',
    }
    this.handleViewSelect = this.handleViewSelect.bind(this)
    this.handleSortSelect = this.handleSortSelect.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
  }

  handleViewSelect(newView) {
    this.setState({view: newView})
  }

  handleSortSelect(newSort) {
    this.setState({sort: newSort})
  }

  handleFilterChange(newFilter) {
    this.setState({filter: newFilter})
  }

  sort(items) {
    items.sort((item1, item2) => {
      let a = item1[this.state.sort]
      let b = item2[this.state.sort]
      if (a === b) {
        if (item1._id > item2._id) {
          return -1
        } else {
          return 1
        }
      } else if (a < b) {
        return -1
      } else {
        return 1
      }
    })
    return items
  }

  filter(items) {
    if (this.state.filter !== "") {
      return items.filter((item) => {
        for (var key in item) {
          if (String(item[key]).toLowerCase().includes(this.state.filter.toLowerCase())) {
            return true
          }
        }
        return false
      })
    }
    return items
  }

  render() {
    const views = {Cards: Cards, Table: Table}
    const fields = Object.keys(this.props.networks[0] || {})
    const View = views[this.state.view]
    const { sort, view, filter } = this.state
    let items = this.sort(this.filter(this.props.networks))
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

              filter={filter}
              onFilterChange={this.handleFilterChange}
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
