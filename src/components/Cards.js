import React from 'react';
import './Cards.css'

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

const Card = ({id, name, description, owner, visibility, updated, nodes, edges, onNetworkDownload}) => (
    <div key={id} className="Card-item">
    <div className="Card">
      <div className="Card-header">
        <div className="Card-header-group">
          <img
            className="Card-header-icon"
            alt="profile"
            src="https://s-media-cache-ak0.pinimg.com/736x/40/32/e0/4032e0031e2e95989f1e76fe3d4f57b7.jpg"
          />
          <h5 className="Card-header-title">{owner}</h5>
        </div>
        <p className="Card-header-subtitle">{visibility}</p>
      </div>
      <img className="Card-image" alt="network" src={getRandomNetworkImage()}/>
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

function getRandomNetworkImage() {
  const images = [
    "http://apps.cytoscape.org/media/cytonca/screenshots/nc%20bc%20cc%2010%25.jpg",
    "http://apps.cytoscape.org/media/cytonca/screenshots/ic.jpg",
    "http://wiki.reactome.org/images/d/d6/NetworkModules.png",
    "http://www.cytoscape.org/images/screenshots/nested_network3.png",
    "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRvmndVvU5W0RDW0FBC31IicZlFPdOqScRFCV-EpL4sLM0NwO3tAw",
    "http://apps.cytoscape.org/media/allegrolayout/screenshots/Mus-musculus-spring-electric-edge.png",
    "https://www.researchgate.net/profile/Omid_Faridani2/publication/265471216/figure/fig6/AS:273683805634568@1442262712224/Figure-5-Functional-network-analysis-cytoscape-generated-layout-of-96-predicted-EBV.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8Hv9aXL_JozZqAedyt4QwA4JgfsUwEwRQDlqwzQwp-Om34f4FHQ",
    "https://camo.githubusercontent.com/21d171eceecccfd8bf0e765f4bb6098ba5c4eff1/687474703a2f2f636c2e6c792f6165786b2f63796a735f7769646765742e706e67",
    "http://www.cytoscape.org/manual/images/huge_network_igraph.png",
    "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRx_75nPTwZo9rsNgw5e1EIcnsqyQ9BwrmhqqS30yXxC13eATsuvw",
    "http://nemo-cyclone.sourceforge.net/ecoli.regulationtrancriptionel.circular.all.export.jpg"
  ]
  let image = Math.floor(Math.random() * images.length)
  return images[image]
}

export default Cards
