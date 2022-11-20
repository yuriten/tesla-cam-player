import React from "react"

const toTime = number => {
  let minutes = Math.floor(number / 60)
  if (minutes < 10) {
    minutes = `0${minutes}`
  }
  let seconds = Math.floor(number % 60)
  if (seconds < 10) {
    seconds = `0${seconds}`
  }
  return `${minutes}:${seconds}`
}

const ToolsLine = props => {
  let { totalTime, currentTime } = props

  return (
    <div className="tools-line w-full flex items-center px-5 py-2">
      <div>
        {toTime(currentTime)} / {toTime(totalTime)}
      </div>
      <div className="ml-auto space-x-2">
        <button className="btn btn-sm btn-outline" onClick={props.jumpPrevious}>
          上一个
        </button>
        <button className="btn btn-sm btn-outline" onClick={props.jumpNext}>
          下一个
        </button>
      </div>
    </div>
  )
}

export default ToolsLine
