import localforage from "localforage"
import classNames from "classnames"

// Todo 虽然尝试缓存了文件句柄，但基本不可用，需排查原因


// 一个时间单元，这个时间点包含了 4 个视频文件
export class TimePointUnit {
  constructor(timePoint, file) {
    // 初始化
    this.rawTimePoint = timePoint
    let d = timePoint.split("_")
    this.day = d[0]
    this.date = d[1].replaceAll("-", ":")
    this.shortDay = this.day.slice(5)
    this.timeStamp = new Date(`${this.day}T${this.date}`).getTime()

    // 外层会自动设置
    this.front = null
    this.back = null
    this.left_repeater = null
    this.right_repeater = null

    this.saveType = file?.relativePath?.[0]
    // SentryClips // 哨兵模式
    // RecentClips // 最近的
    // SavedClips // 手动保存的
    // console.log("sentry", file.relativePath[0])
  }
}

// 用来验证当前是否对句柄仍然持有权限
const verifyPermission = async (fileHandle, readWrite) => {
  const options = { mode: "read" }
  let query = await fileHandle.queryPermission(options)
  if (query === "granted") {
    return true
  }
  // auto request permission. If the user grants permission, return true.
  // let b = await fileHandle.requestPermission(options)
  // if (b === "granted") {
  //   return true
  // }
  return false
}

// 静默请求 handle，如果有的话就给，没有也不打扰
export const silentlyRequestHandle = async () => {
  const handle = await localforage.getItem("directory_TeslaCam")

  if (handle) {
    let permission = await verifyPermission(handle).catch(e => {
      return false
    })
    if (permission === true) {
      return handle
    }
  }
  return false
}

export const requestHandle = async () => {
  // 先尝试静默请求，实在不行再要权限
  let h = await silentlyRequestHandle()
  if (h !== false) {
    return h
  }
  const directoryHandle = await window.showDirectoryPicker()
  localforage.setItem("directory_TeslaCam", directoryHandle)
  return directoryHandle
}

// dict to array
export const dictToArray = dict => {
  let arr = []
  for (let key in dict) {
    arr.push(dict[key])
  }
  return arr
}

export const pipeSort = array => {
  return array.sort((a, b) => a.timeStamp - b.timeStamp)
}

export const pipeFilter = array => {
  return array
}

export const pipeStyle = array => {
  // 本质上是如何为数组中的特殊数据打标记
  // 什么是特殊数据？
  // 第一个、最后一个
  // if next.day !== node.day, 那么两者都特殊
  let idx = 0
  let currenDay = array[0].day
  array[0].linkStart = true

  while (idx < array.length) {
    let node = array[idx]
    let next = array[idx + 1]
    if (next && next.day !== currenDay) {
      node.linkEnd = true
      next.linkStart = true
      currenDay = next.day
      // 在当前下标插入一个空数据
      // array.splice(idx + 1, 0, null)
    }
    if (next === undefined) {
      node.linkEnd = true
    }
    if (idx % 36 === 0) {
      node.timeLineMark = true
    }
    idx += 1
  }
  return array
}

// 获取遍历所有文件 handle（套路）
export const getFiles = async directoryHandle => {
  // 自动调用浏览器 api，并返回文件 handle（类型是 File 文件对象）
  // 后续可以通过 handle 执行对应操作
  const getRelativePath = async entry => {
    return await directoryHandle.resolve(entry)
  }

  async function* getFilesRecursively(entry) {
    if (entry.kind === "file") {
      const file = await entry.getFile()
      if (file !== null) {
        file.relativePath = await getRelativePath(entry)
        yield file
      }
    } else if (entry.kind === "directory") {
      for await (const handle of entry.values()) {
        yield* getFilesRecursively(handle)
      }
    }
  }

  let fileHandles = []
  for await (const fh of getFilesRecursively(directoryHandle)) {
    // console.log("at push, -> fileHandle", fh)
    if (fh.type === "video/mp4") {
      fileHandles.push(fh)
    }
  }
  return fileHandles
}

export const getTimePoints = handles => {
  // 套路，输入零散的 handles，每 4 个一组整合成一个「时间节点」
  // 返回所有的时间节点组
  let points = {}
  for (let file of handles) {
    let fileName = file.name
    // 奇怪的不知道为什么有可能会是这个开头，稍微修正一下
    if (fileName.startsWith("._")) {
      fileName = fileName.slice(2)
    }

    let timePoint = fileName.slice(0, 19)
    let dir = fileName.slice(20).split(".")[0]
    let o = points[timePoint]
    if (!o) {
      points[timePoint] = new TimePointUnit(timePoint, file)
      o = points[timePoint]
    }
    o[dir] = file
  }
  return points
}

export const useTimeFromStamp = stamp => {
  let date = new Date(stamp)
  let Y = date.getFullYear() + "-"
  let M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-"
  let D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()

  let h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
  let m = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
  let s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
  return { date: Y + M + D, time: `${h}:${m}:${s}` }
}

export const genVideoClass = (code, sclaeView) => {
  let dict = {
    front: "top-0 left-1/10",
    left: "left-0 top-1/10",
    right: "right-0 top-1/10",
    back: "left-1/10 bottom-0",
  }
  return classNames("m-0 object-fill cursor-pointer hover:border-2", {
    [`absolute w-4/5 h-4/5 z-10 border-2 ${dict[code]}`]: sclaeView === code,
    "w-full h-full": sclaeView !== code,
  })
}
