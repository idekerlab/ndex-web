import React, { Component } from 'react'
import './Choose.css'

import Navbar from '../components/Navbar'
import Profile from '../components/Profile'
import Browser from '../components/Browser'
import SearchBar from '../components/SearchBar'
import Header from '../components/Header'
import Waiting from '../components/Waiting'

class Choose extends Component {

  constructor(props) {
    super(props)
    this.state = {
      term: this.props.searchTerm,
      numNetworks: 0,
      networks: [],
      loading: false,
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
    }
    this.handleSearch(this.props.searchTerm)
  }

  handleTermChange = (term) => {
    this.setState({ term })
  }

  componentDidMount() {
    document.title = "Browse NDEx";
  }
  handleSearch = (term = "") => {
    let profile = this.props.selectedProfile
    let headers = { 'Content-Type': 'application/json'}
    if (Object.keys(profile).length !== 0) {
      headers['Authorization'] = 'Basic ' + btoa(profile.userName + ':' + profile.password)
    }
    if (profile.serverAddress === undefined) {
      profile = { serverAddress: "http://ndexbio.org" }
    }
    fetch(profile.serverAddress + '/v2/search/network?size=200', {
      method: 'POST',
      body: JSON.stringify({ searchString: term }),
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
        this.setState({ networks })
    })
    .catch((error) => {
      this.setState({networks : [], numNetworks: 0})
      alert("There's something wrong with your connection and we could not contact NDEx. Please try again after the issue has been resolved.")
      })
  }

  handleDownloadNetwork(networkId) {
    this.setState({ loading: true })
    let {
      serverAddress,
      userName,
      password,
    } = this.props.selectedProfile
    if (serverAddress == undefined) {
      serverAddress = "http://ndexbio.org"
    }
    const payload = JSON.stringify({
      userId: userName,
      password: password,
      serverUrl: serverAddress + '/v2',
      uuid: networkId
    })
    fetch('http://localhost:1234/cyndex2/v1/networks', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: payload
    })
      .then((resp) => {
        if (!resp.ok){
          throw new Error(resp.statusText)
        }
        return resp
      })
      .then((blob) => blob.json())
      .then((resp) => {
        this.setState({ loading: false })
      })
      .catch((error) => {
        alert("There's something wrong with your connection and we were unable to import the network. Please try again after the issue has been resolved.")
        this.setState({loading:false})
      })
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
      term,
      numNetworks,
      networks,
      exampleTerms
    } = this.state
    const headerSuffix = term ? "for " + term : ""
    const subtitle = numNetworks > 200 ? "Showing 200 out of " : ""
    return (
      <div className="Choose">
        { this.state.loading ? <Waiting text="Loading network from NDEx... Please wait."/> : null}
        <Navbar>
          <SearchBar
            term={term}
            examples={exampleTerms}
            handleTermChange={this.handleTermChange}
            handleSearch={this.handleSearch}
          />
          <Profile
            profiles={profiles}
            selectedProfile={selectedProfile}
            onProfileAdd={handleProfileAdd}
            onProfileSelect={handleProfileSelect}
            onProfileDelete={handleProfileDelete}
            onProfileLogout={() => {
              handleProfileLogout()
              this.handleSearch(term)
            }}
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
