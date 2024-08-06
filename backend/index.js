import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'

const app = express()

const corsOptions = {
    origin: [
        'https://xoxo-showdown.vercel.app',
        'https://xoxo.sadanandmiskin.xyz',
        "http://localhost:5173"
    ],
    methods: ['GET', 'POST'],
    credentials: true 
}
app.use(cors(corsOptions))

const server = http.createServer(app)

const io = new Server(server, {
    cors: corsOptions
})

let players = []
let currentPlayer = 'X'
let moveCount = 0  

io.on("connection", (socket) => {
    if (players.length < 2) {
        const player = {
            id: socket.id,
            symbol: players.length === 0 ? 'X' : 'O'
        }
        players.push(player)
        socket.emit('playerAssigned', player)

        if (players.length === 2) {
            io.emit('gameStart', { players, currentPlayer })
        }
    } else {
        socket.emit('roomFull')
    }

    socket.on('makeMove', (data) => {
        moveCount++  

        if (moveCount === 9) {  
            io.emit('draw')
            moveCount = 0  
        } else {
            io.emit('updateBoard', data)
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X'
            io.emit('nextTurn', currentPlayer)
        }
    })

    socket.on('win', (data) => {
        io.emit('win', data)
        moveCount = 0  
    })

    socket.on('resetGame', () => {
        moveCount = 0  
        currentPlayer = 'X'
        io.emit('gameStart', { players, currentPlayer })
    })

    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id)
        if (players.length < 2) {
            io.emit('playerLeft')
            moveCount = 0  
        }
    })
})

app.get('/', (req, res) => {
    res.json({
        server: 'XOXO ShowDown',
        on: 'Sads'
    })
})

server.listen(3000, () => {
    console.log('server listening on port 3000')
})