import React from "react"
import { PlayIcon, PauseIcon } from "@heroicons/react/outline"

const PlayButtons = props => {
  return (
    <>
      {props.playing ? (
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={props.pause}
        >
          <PauseIcon />
        </button>
      ) : (
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={props.play}
        >
          <PlayIcon />
        </button>
      )}
    </>
  )
}

const ProgressBar = props => {
  return (
    <div className="bar-container w-full px-4 flex items-center space-x-4">
      <PlayButtons {...props} />
      <input
        type="range"
        min="1"
        step={0.5}
        value={props.currentTime}
        max={props.totalTime}
        onChange={e => {
          props.setValue(e.target.value)
        }}
        className="range range-sm"
      />
    </div>
  )
}

export default ProgressBar
