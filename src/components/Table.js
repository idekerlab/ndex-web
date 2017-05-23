import React from 'react'
import './Table.css'

const Table = ({items}) => {
  const filter = (key) => key != "_id" && key != "description"
  const keys = Object.keys(items[0]).filter(filter)
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
          items.map((item, index) => (

            <tr key={index} className="Table-row">

                <td className="Table-checkbox"><button className="Table-download">Import</button></td>

              {keys.map((key, index) => key === "modified" || key === "created" ?
              <td key={index}>{new Date(item[key]).toDateString()}</td> :
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
