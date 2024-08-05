import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Square from './Square'
import '../App.css'
import { Winner } from '../Hooks/Winner'

const socket = io('https://rattle-fast-nemophila.glitch.me', {
  transports: ['websocket'],
  withCredentials: true
})

export const Board = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [playerSymbol, setPlayerSymbol] = useState(null)
  const [winner, setWinner] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [gameStatus, setGameStatus] = useState('Waiting for opponent...')

  useEffect(() => {
    socket.on('playerAssigned', (player) => {
      setPlayerSymbol(player.symbol)
      setGameStatus(player.symbol === 'X' ? 'Waiting for opponent...' : 'Game starting...')
    })

    socket.on('gameStart', ({ currentPlayer }) => {
      setGameStatus(`Game started! ${currentPlayer}'s turn`)
    })

    socket.on('updateBoard', (data) => {
      setBoard(prevBoard => {
        const newBoard = [...prevBoard]
        newBoard[data.index] = data.value
        return newBoard
      })
    })

    socket.on('nextTurn', (nextPlayer) => {
      setCurrentPlayer(nextPlayer)
      setGameStatus(`${nextPlayer}'s turn`)
    })

    socket.on('playerLeft', () => {
      setGameStatus('Opponent left. Waiting for new player...')
      setBoard(Array(9).fill(null))
      setWinner(null)
    })

    socket.on('roomFull', () => {
      setGameStatus('Room is full. Please try again later.')
    })

    socket.on('win', (data) => {
      setWinner(data)
      setGameStatus(`Winner is ${data}`)
      setSeconds(3)
    })

    return () => {
      socket.off('playerAssigned')
      socket.off('gameStart')
      socket.off('updateBoard')
      socket.off('nextTurn')
      socket.off('playerLeft')
      socket.off('roomFull')
    }
  }, [])

  const handleOnclick = (i) => {
    if (board[i] || winner || currentPlayer !== playerSymbol) {
      setGameStatus('Not Your Turn')
      return
    }

    socket.emit('makeMove', { value: playerSymbol, index: i })

    const newBoard = [...board]
    newBoard[i] = playerSymbol
    setBoard(newBoard)
    
    const win = Winner(newBoard)
    if (win) {
      socket.emit('win', win)
      setWinner(win)
      setSeconds(3)
      setGameStatus(`Winner: ${win}`)
    }
    
  }

  useEffect(() => {
    let timer
    if (seconds > 0) {
      timer = setTimeout(() => setSeconds(seconds - 1), 1000)
    } else if (seconds === 0 && winner) {
      resetGame()
    }
    return () => clearTimeout(timer)
  }, [seconds, winner])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setWinner(null)
    setGameStatus('Start the Game: ')
    socket.emit('resetGame')
  }

  return (
    <div className='area'>
      <h1>XOXO ShowDown !!</h1>
      <div className="content">
        <h2>{gameStatus}</h2>
        {winner && <h4>Resetting in {seconds} seconds</h4>}
        {[0, 1, 2].map(row => (
          <div key={row} className="board-row">
            {[0, 1, 2].map(col => {
              const index = row * 3 + col
              return (
                <Square 
                  key={index}
                  value={board[index]} 
                  onClick={() => handleOnclick(index)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
