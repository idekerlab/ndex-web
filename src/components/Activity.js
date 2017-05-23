import React from 'react'
import Dropdown, { DropdownAction } from './Dropdown'
import './Activity.css'

const Activity = ({pending, completed})  => (
  <div>
    <ActivityBadge numActivities={pending.length}/>
    <Dropdown
      title="Activity"
      content={
        <ActivityList
          pending={pending}
          completed={completed}
        />
        }
      actions={[
        <DropdownAction
          label="Clear Completed"
        />,
        <DropdownAction
          label="Delete Pending"
        />
      ]}
    />
  </div>
)

const ActivityBadge = ({numActivities}) => (
  <div className="ActivityBadge">
    <span className={numActivities != 0 ?
      "ActivityBadge-counter ActivityBadge-active" : "ActivityBadge-counter"
    }>
      ⇩ {numActivities != 0 ? numActivities : null}
    </span>
  </div>
)

const ActivityList = ({pending, completed}) => {
  const activities = pending.concat(completed)
  return (
    <ul className="ActivityList">
      {activities.map((activity) => (
        <li>
          <h6>{activity.name}</h6>
          <p>{activity.status}</p>
        </li>
      ))}
    </ul>
  )
}


export default Activity
