import React from 'react'
import './Table.css'
import copy from 'copy-to-clipboard'

function copyFunc(uuid) {
  //let url = "http://ndexbio.org/#/newNetwork/" + uuid
  copy(uuid)
  alert("Copied UUID " + uuid + " to clipboard")
}

const Table = ({items, onNetworkDownload}) => {
  const filter = (key) => key !== "_id" && key !== "description"
  const keys = Object.keys(items[0]).filter(filter)
  return (
    <table className="Table">
      <thead className="Table-header">
        <tr>
            <th className="Table-checkbox">UUID</th>
            <th className="Table-checkbox">Import</th>

          {keys.map((key, index) => <th key={index}>{key}</th>)}
        </tr>
      </thead>
      <tbody className="Table-body">
        {
          items.map((item, index) => (

            <tr key={index} className="Table-row">
                <td className="Table-checkbox">
                  <img className="Table-clipboard-img" onClick={(e) => copyFunc(item._id)} title="Copy NDEx UUID to clipboard" alt="NDEx UUID" src="https://clipboardjs.com/assets/images/clippy.svg"/>
                </td>
                <td className="Table-checkbox"><button className="Table-download" onClick={() => onNetworkDownload(item._id)}>Import</button></td>

              {keys.map((key, index) => key === "modified" || key === "created" ?
              <td key={index} title={new Date(item[key]).toString()}>{new Date(item[key]).toDateString()}</td> :
              <td key={index}>{item[key]}</td>)
            }
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}

export default Table
