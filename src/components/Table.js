import React from 'react'
import './Table.css'

const Table = ({items, onNetworkDownload}) => {
  const filter = (key) => key !== "_id" && key !== "description" && key !== 'accessKey' && key !== 'server';
  const keys = Object.keys(items[0]).filter(filter);
  return (
    <table className="Table">
      <thead className="Table-header">
        <tr>
            <th className="Table-checkbox">Import</th>

          {keys.map((key, index) => <th key={index}>{key}</th>)}
        </tr>
      </thead>
      <tbody className="Table-body">
      {
          items.map((item, index) => {
              const accessKey = item.accessKey;
              const serverURL = item.server;
              return (
                  <tr key={index} className="Table-row">
                      <td className="Table-checkbox">
                          <button className="Table-download" onClick={() => {
                              onNetworkDownload(item._id, accessKey,serverURL)
                          }}>Import
                          </button>
                      </td>

                      {keys.map((key, index) => {
                          if (key === "modified" || key === "created") {
                              return <td key={index} className='date'
                                         title={new Date(item[key]).toString()}>{new Date(item[key]).toLocaleString()}</td>
                          } else if (key === "name") {
                              return <td key={index} className='name' title={item['description']}>{item[key]}</td>
                          }
                          return <td key={index}>{item[key]}</td>
                      })
                      }
                  </tr>
              )
          })
      }
      </tbody>
    </table>
  )
}

export default Table
