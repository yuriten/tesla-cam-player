import React, { useEffect, useState } from 'react'
import { useNumber, useToggle, useKeyPressEvent, useEffectOnce } from 'react-use'
import classNames from 'classnames'

import ProgressBar from './progress-bar'
import ToolsLine from './tools-line'
import FilterControls from './controls'
import Console from './console'
import { requestHandle, silentlyRequestHandle, getFiles } from './model'
import { dictToArray, pipeFilter, pipeStyle, pipeSort } from './model'
import { getTimePoints, genVideoClass } from './model'

// 句柄持久化参考这个链接：https://web.dev/file-system-access/#storing-file-handles-or-directory-handles-in-indexeddb
const TeslaPlayer = () => {
  const [cubes, setCubes] = useState([]) // 时间点（被渲染成小方块）
  const [playing, togglePlaying] = useToggle(false) // 正在播放
  const [timePoint, setTimePoint] = useState({}) // 当前选中的时间点
  const [typeFilter, setTypeFilter] = useState('all') // 过滤器，限制哨兵模式或者其他类型
  const [sclaeView, setSclaeView] = useState('') // 视角放大
  const [currentTime, ctc] = useNumber(0) //播放的进度
  const [totalTime, ttc] = useNumber(0) // 播放的总时间

  const videoRefs = {
    front: React.createRef(),
    back: React.createRef(),
    left: React.createRef(),
    right: React.createRef(),
  }

  // 为了保持数据的单一中立，所有显示逻辑都用 cubes 反查，而不是事先处理各种分类
  const filtedCubs = cubes.filter((cube) => {
    if (typeFilter === 'all') {
      return true
    }
    return cube.saveType === typeFilter
  })

  // 拿到 handle 去处理 handle
  const handleFix = async (handle) => {
    let files = await getFiles(handle)
    let pointsDict = getTimePoints(files)
    let array = dictToArray(pointsDict)
    let filted = pipeFilter(array)
    let sorted = pipeSort(filted)
    let styled = pipeStyle(sorted)
    setCubes(styled)
    changeVideo(styled[0])
  }

  // 当节点被改变的时候，设置 refs 的 src
  useEffect(() => {
    if (timePoint && timePoint.front) {
      videoRefs.front.current.src = window.URL.createObjectURL(timePoint.front)
      videoRefs.back.current.src = window.URL.createObjectURL(timePoint.back)
      videoRefs.left.current.src = window.URL.createObjectURL(timePoint.left_repeater)
      videoRefs.right.current.src = window.URL.createObjectURL(timePoint.right_repeater)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePoint])

  // 尝试自动获取 handle
  useEffectOnce(() => {
    let autoLoad = async () => {
      let handle = await silentlyRequestHandle()
      if (handle !== false) {
        handleFix(handle)
      }
    }
    autoLoad()
  })

  // 监听播放进度
  useEffect(() => {
    let { front } = videoRefs
    let intervalFn = setInterval(() => {
      if (front.current) {
        ctc.set(front.current?.currentTime)
      }
    }, 200)
    return () => clearInterval(intervalFn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRefs.front, ctc])

  // 监听 filter 切换
  useEffect(() => {
    if (filtedCubs.length > 0) {
      changeVideo(filtedCubs[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter])

  // 监听空格
  useKeyPressEvent(' ', () => {
    if (timePoint && timePoint.front) {
      playing ? pause() : play()
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
      }
    })
  }, [])

  // 选择一个节点
  const changeVideo = (cube) => {
    setTimePoint(cube)
    togglePlaying(false)
  }

  // 设置 4 个视频 refs 的播放时间
  const setRefsTime = (time) => {
    let { front, back, left, right } = videoRefs
    if (front.current) {
      front.current.currentTime = time
    }
    if (back.current) {
      back.current.currentTime = time
    }
    if (left.current) {
      left.current.currentTime = time
    }
    if (right.current) {
      right.current.currentTime = time
    }
  }

  const play = () => {
    togglePlaying(true)
    videoRefs.front.current.play()
    videoRefs.left.current.play()
    videoRefs.right.current.play()
    videoRefs.back.current.play()
  }

  const pause = () => {
    togglePlaying(false)
    videoRefs.front.current.pause()
    videoRefs.left.current.pause()
    videoRefs.right.current.pause()
    videoRefs.back.current.pause()
  }

  const jumpNext = () => {
    let foundIdx = cubes.findIndex((i) => i.rawTimePoint === timePoint.rawTimePoint)
    if (foundIdx !== -1) {
      let next = cubes[foundIdx + 1]
      next && changeVideo(next)
    }
  }

  const jumpPrevious = () => {
    let foundIdx = cubes.findIndex((i) => i.rawTimePoint === timePoint.rawTimePoint)
    if (foundIdx !== -1) {
      let previous = cubes[foundIdx - 1]
      previous && changeVideo(previous)
    }
  }

  // 最终作为组件呈现
  return (
    <div className='flex-center flex-col select-none min-h-screen'>
      <div className='loader pl-0 pb-6 mx-auto'>
        <button
          className='btn btn-primary normal-case'
          onClick={async () => {
            let handle = await requestHandle().catch((e) => {
              // 未选择文件
            })
            handle && handleFix(handle)
          }}
        >
          载入 TeslaCam 文件夹
        </button>
      </div>

      <div
        className={classNames('flex flex-col relative mx-auto pb-20 w-[700px]', {
          hidden: cubes.length === 0,
        })}
      >
        <div className='flex flex-wrap relative'>
          <div className='bg-slate-800 h-52 w-1/3 rounded-tl-xl flex flex-col pt-2'>
            <Console timePoint={timePoint} currentTime={currentTime} />
          </div>
          <div className={classNames('h-52 w-1/3 bg-slate-300')}>
            {timePoint.front && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                ref={videoRefs.front}
                className={genVideoClass('front', sclaeView)}
                onClick={() => {
                  sclaeView !== 'front' ? setSclaeView('front') : setSclaeView('')
                }}
                onLoadedMetadata={() => {
                  videoRefs.front.current.currentTime = 0
                  videoRefs.back.current.currentTime = 0
                  videoRefs.left.current.currentTime = 0
                  videoRefs.right.current.currentTime = 0
                  ctc.set(0)
                  setRefsTime(0)
                  ttc.set(videoRefs.front.current.duration)
                }}
                // Todo，自动播放会报错，需要修复
                // onEnded={() => {
                //   jumpNext()
                //   play()
                // }}
              ></video>
            )}
          </div>
          <div className='bg-slate-800 h-52 w-1/3 rounded-tr-xl'></div>
          <div className='h-52 w-1/3 bg-slate-300'>
            {timePoint.left_repeater && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                ref={videoRefs.left}
                className={genVideoClass('left', sclaeView)}
                onClick={() => {
                  sclaeView !== 'left' ? setSclaeView('left') : setSclaeView('')
                }}
              />
            )}
          </div>
          <div className='bg-slate-800 h-52 w-1/3 flex items-center justify-center'></div>
          <div className='h-52 w-1/3 bg-slate-300'>
            {timePoint.right_repeater && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                ref={videoRefs.right}
                className={genVideoClass('right', sclaeView)}
                onClick={() => {
                  sclaeView !== 'right' ? setSclaeView('right') : setSclaeView('')
                }}
              ></video>
            )}
          </div>
          <div className='bg-slate-800 h-52 w-1/3 rounded-bl-xl'></div>
          <div className='h-52 w-1/3 bg-slate-300 '>
            {timePoint.back && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                ref={videoRefs.back}
                className={genVideoClass('back', sclaeView)}
                onClick={() => {
                  sclaeView !== 'back' ? setSclaeView('back') : setSclaeView('')
                }}
              ></video>
            )}
          </div>
          <div className='bg-slate-800 h-52 w-1/3 rounded-br-xl'></div>
        </div>
        <div
          className={classNames(
            'controls-area mt-2 border w-full pb-4 pt-4 flex flex-col relativ rounded-xl',
          )}
        >
          <ProgressBar
            play={play}
            pause={pause}
            playing={playing}
            totalTime={totalTime}
            currentTime={currentTime}
            setValue={(newValue) => {
              ctc.set(newValue)
              setRefsTime(newValue)
            }}
          />
          <ToolsLine
            totalTime={totalTime}
            currentTime={currentTime}
            jumpNext={jumpNext}
            jumpPrevious={jumpPrevious}
          />
          <FilterControls
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            filtedCubs={filtedCubs}
            changeVideo={changeVideo}
            timePoint={timePoint}
          />
        </div>
      </div>
    </div>
  )
}

export default TeslaPlayer
