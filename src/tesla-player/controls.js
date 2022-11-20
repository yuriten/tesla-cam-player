import React from 'react'
import classNames from 'classnames'

const filterButtons = [
  { code: 'all', text: 'No Filter' },
  { code: 'SentryClips', bgColor: 'bg-red-300' },
  { code: 'RecentClips', bgColor: 'bg-blue-300' },
  { code: 'SavedClips', bgColor: 'bg-yellow-300' },
]

const FilterControls = (props) => {
  let { typeFilter, setTypeFilter, filtedCubs, timePoint, changeVideo } = props
  const cubeDays = filtedCubs.filter((cube) => cube.linkStart === true)
  const currenDayTimePoints = filtedCubs.filter((cube) => timePoint.day === cube.day)

  return (
    <>
      <div className='type-picker flex items-center pl-4 mt-4'>
        <div className='text-sm flex-shrink-0 mr-2'>Clips</div>
        <div className='flex items-center flex-wrap'>
          <div className='btn-group'>
            {filterButtons.map((i) => {
              return (
                <button
                  className={classNames('btn btn-sm normal-case btn-outline', {
                    'btn-primary': typeFilter === i.code,
                  })}
                  onClick={() => setTypeFilter(i.code)}
                  key={i.code}
                >
                  {i.bgColor && <div className={`h-4 w-4 m-1 rounded-sm ${i.bgColor}`} />}
                  {i.text ? i.text : i.code}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className='cube-points flex items-center pl-4 mt-6'>
        <div className='text-sm flex-shrink-0 mr-2'>Time</div>
        <div className='flex items-center flex-wrap'>
          {cubeDays.map((i, idx) => {
            return (
              <button
                key={`days_${i.day}_${idx}`}
                onClick={() => {
                  changeVideo(i)
                }}
                className={classNames('btn btn-sm btn-outline mr-2 mb-1', {
                  'btn-primary': i.day === timePoint.day,
                })}
              >
                {i.day === timePoint.day ? i.day : i.shortDay}
              </button>
            )
          })}
        </div>
      </div>

      <div className='cube-points flex items-center pl-4 mt-4'>
        <div className='text-sm flex-shrink-0 mr-2'>Point</div>
        <div className='flex items-center flex-wrap'>
          {currenDayTimePoints.map((i, idx) => {
            return (
              <div
                key={`points_${i.day}_${idx}`}
                onClick={() => {
                  changeVideo(i)
                }}
                aria-hidden='true'
                onKeyDown={() => {}}
                data-tip={i.date}
                className='h-5 w-5 p-1 cursor-pointer tooltip'
              >
                <div
                  className={classNames('w-full h-full rounded-sm', {
                    'outline outline-1 outline-offset-1': i.date === timePoint.date,
                    'bg-red-300': i.saveType === 'SentryClips', // 哨兵模式
                    'bg-blue-300': i.saveType === 'RecentClips', // 最近保存的
                    'bg-yellow-300': i.saveType === 'SavedClips', // 手动保存的

                    'bg-red-500 outline outline-1 outline-offset-1':
                      i.saveType === 'SentryClips' && i.date === timePoint.date,
                    'bg-blue-500 outline outline-1 outline-offset-1':
                      i.saveType === 'RecentClips' && i.date === timePoint.date,
                    'bg-yellow-600 outline outline-1 outline-offset-1':
                      i.saveType === 'SavedClips' && i.date === timePoint.date,
                  })}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default FilterControls
