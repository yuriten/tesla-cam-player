import React from 'react'
import { createRoot } from 'react-dom/client'
import TeslaPlayer from './tesla-player'
import './main.css'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<TeslaPlayer />)
