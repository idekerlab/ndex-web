import React, { Component } from 'react'
import './Choose.css'

import Navbar from '../components/Navbar'
import Profile from '../components/Profile'
import Browser from '../components/Browser'
import SearchBar from '../components/SearchBar'
import Header from '../components/Header'

class Choose extends Component {

  constructor(props) {
    super(props)
    this.state = {
      searchTerm: this.props.searchTerm,
      numNetworks: 0,
      networks: [],
      pending: [],
      comppleted: [],
      exampleTerms: [
        {
          text: 'melanoma',
          description: 'Any mention of melanoma'
        },
        {
          text: 'RBL2',
          description: 'Any mention of RBL2'
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
    }
    this.search()
  }

  search(term = undefined) {
    let searchTerm = this.state.searchTerm
    let selectedProfile = this.props.selectedProfile
    if (term !== undefined) {
      searchTerm = term
    }
    let headers = { 'Content-Type': 'application/json'}
    if (Object.keys(selectedProfile).length !== 0) {
      headers['Authorization'] = 'Basic ' + btoa(selectedProfile.userName + ':' + selectedProfile.password)
    }
    if (selectedProfile.serverAddress === undefined) {
      selectedProfile = { serverAddress: "http://ndexbio.org" }
    }
    fetch(selectedProfile.serverAddress + '/v2/search/network?size=200', {
      method: 'POST',
      body: JSON.stringify({ searchString: searchTerm }),
      headers: new Headers(headers),
    }).then((response) => {
      return response.json()
    }).then((blob) => {
      this.setState({numNetworks: blob.numFound})
      return blob.networks
    }).then((networks) => {
      if (networks === undefined) {
        networks = []
      } else {
        networks = networks.map((network) => ({
            _id: network.externalId,
            name: network.name,
            description: (network.description || '').replace(/<(?:.|\n)*?>/gm, ''),
            owner: network.owner,
            visibility: network.visibility,
            nodes: network.nodeCount,
            edges: network.edgeCount,
            created: network.creationTime,
            modified: network.modificationTime,
        }))
      }
      this.setState({networks})
    })
  }

  handleSearchtermChange(term) {
    this.setState({ searchTerm: term })
    this.search(term)
  }

  handleDownloadNetwork(networkId) {
    console.log("Handle download called with " + networkId)
  }

  render() {
    const {
      profiles,
      selectedProfile,
      handleProfileAdd,
      handleProfileSelect,
      handleProfileDelete,
      handleProfileLogout
    } = this.props
    const {
      searchTerm,
      numNetworks,
      networks,
      exampleTerms
    } = this.state
    const headerSuffix = searchTerm ? "for " + searchTerm : ""
    const subtitle = numNetworks > 200 ? "Showing 200 out of " : ""
    return (
      <div className="Choose">
        <Navbar>
          <SearchBar
            searchterm={searchTerm}
            exampleTerms={exampleTerms}
            onSearchtermChange={(term) => this.handleSearchtermChange(term)}
          />
          <Profile
            profiles={profiles}
            selectedProfile={selectedProfile}
            onProfileAdd={handleProfileAdd}
            onProfileSelect={handleProfileSelect}
            onProfileDelete={handleProfileDelete}
            onProfileLogout={handleProfileLogout}
          />
        </Navbar>
        <Header
          title={"Search results " + headerSuffix}
          subtitle={subtitle + numNetworks + " hits"}
        />
        <Browser
          networks={networks}
          onNetworkDownload={(networkId) => this.handleDownloadNetwork(networkId)}
        />
      </div>
    )
  }
}

export default Choose
