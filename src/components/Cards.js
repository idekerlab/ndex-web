import React from 'react';
import './Cards.css'

import profileBadge from '../default-profile.png'
import copy from 'copy-to-clipboard'

const Cards = ({items, onNetworkDownload}) => (
  <div className="Cards">
    {items.map((item) => (
      <Card
        key={item._id}
        id={item._id}
        name={item.name}
        description={item.description}
        owner={item.owner}
        visibility={item.visibility}
        updated={item.modified}
        nodes={item.nodes}
        edges={item.edges}
        onNetworkDownload={onNetworkDownload}
      />
    ))}
  </div>
)

function copyFunc(uuid) {
  let url = "http://ndexbio.org/#/newNetwork/" + uuid
  copy(url)
  alert("Copied " + url + " to clipboard")
}

const Card = ({id, name, description, owner, visibility, updated, nodes, edges, onNetworkDownload}) => (
    <div key={id} className="Card-item">
    <div className="Card">
      <div className="Card-header">
        <div className="Card-header-group">
          <img
            className="Card-header-icon"
            alt="profile"
            src={profileBadge}
          />
          <h5 className="Card-header-title">{owner}</h5>
        </div>

        <div className="Card-header-group">
          <p>{visibility}</p>
          <img className="Card-clipboard-img" onClick={(e) => copyFunc(id)} tooltip="Copy NDEx UUID to clipboard" alt="NDEx UUID" src="https://clipboardjs.com/assets/images/clippy.svg"/>
        </div>
      </div>
      <object className="Card-image" alt="network" data={getImage(id)} type="image/png"> <img src=""/> </object>
      <div className="Card-content">
        <h5 className="Card-content-title">
          {name}
        </h5>
        <p className="Card-content-last-activity">
          {"Last updated " + new Date(updated).toDateString()}
        </p>
        <div className="Card-content-facts">
          <p className="Card-content-fact">{ nodes + " nodes"}</p>
          <p className="Card-content-fact">{ edges + " edges"}</p>
        </div>
        { description ? <p className="Card-content-description">
          {description}
        </p> : null }
        <button className="Card-content-download" onClick={() => onNetworkDownload(id)}>Import</button>
      </div>
    </div>
  </div>
)

function getImage(id) {
  return "http://v1.storage.cytoscape.io/images/" + id + ".png"
}

export default Cards
