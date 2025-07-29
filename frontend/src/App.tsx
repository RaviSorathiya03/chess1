import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import ChessBoard from './components/ChessBoard'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/play' element={<ChessBoard />} />
    </Routes>
  )
}

export default App
