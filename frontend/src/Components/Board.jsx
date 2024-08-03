import React, { useEffect, useState } from 'react'
import Square from './Square'
import '../App.css'
import { Winner } from '../Hooks/Winner'

export const Board = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [valid, setValid] = useState(true)
  const [winner, setWinner] = useState(null)
  const [seconds, setSeconds] = useState(0)

  const handleOnclick = (i) => {
    if (board[i] || winner) {
      setValid(false)
      return
    }
    
    setValid(true)
    const newBoard = board.slice()
    newBoard[i] = xIsNext ? 'X' : 'O'
    setBoard(newBoard)

    const win = Winner(newBoard)
    
    if (win) {
      setWinner(win)
      setSeconds(3)
    } else {
      setXIsNext(!xIsNext)
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
    setXIsNext(true)
    setWinner(null)
    setValid(true)
  }

  const draw = () => {
    return 'Draw'
  }
  const status = winner 
    ? `Winner: ${winner}` 
    : board.every(Boolean) 
      ? draw()
      : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className='area'>
      <div className="content">
        <h2>{status}</h2>
        {winner && <h4>Resetting in {seconds} seconds</h4>}
        {!valid && <h6 className='valid'>Cannot overwrite</h6>}
        
        {[0, 1, 2].map(row => (
          <div key={row} className="board-row">
            {[0, 1, 2].map(col => {
              const index = row * 3 + col;
              return (
                <Square 
                  key={index}
                  value={board[index]} 
                  onClick={() => handleOnclick(index)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  )
}