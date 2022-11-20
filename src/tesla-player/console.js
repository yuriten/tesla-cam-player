import React from 'react'
import classNames from 'classnames'
import { useTimeFromStamp } from './model'

const Console = (props) => {
  let { timePoint, currentTime } = props
  let stamp = Number(timePoint.timeStamp) + Number(currentTime) * 1000
  let { date, time } = useTimeFromStamp(stamp)

  return (
    <div
      className={classNames({
        'opacity-0': !Boolean(timePoint && timePoint.front),
      })}
    >
      <code
        className='text-neutral-content absolute z-20 font-semibold text-sm py-1 px-2'
        style={{ background: 'rgba(30, 42, 59, 0.5)' }}
      >
        {timePoint.saveType} Video
      </code>
      <code
        className='text-neutral-content absolute z-20 top-10 font-semibold text-sm py-1 px-2'
        style={{ background: 'rgba(30, 42, 59, 0.5)' }}
      >
        {date} {time}
      </code>
    </div>
  )
}

export default Console
