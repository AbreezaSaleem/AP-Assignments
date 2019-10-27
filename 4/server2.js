const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')
const mongoose = require('mongoose')

const readFile = file => new Promise( (resolve, reject) => 
	fs.readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data)) )


const server = http.createServer(async (request, respose) =>
{
	try
	{
		respose.end(await readFile(request.url.substr(1)))
	} catch (err)
	{
		console.error(err)
		respose.end()
	}
})




function generateBoard()
{
	let markedPositions = []
	for (let i = 0; i < 8; i++)
	{
		if (i == 3)
			markedPositions.push( [' |__| ',' |__| ',' |__| ',' | X| ',' | O| ',' |__| ', ' |__| ',' |__| '] )
		else if (i == 4)
			markedPositions.push( [' |__| ',' |__| ',' |__| ',' | O| ',' | X| ',' |__| ', ' |__| ',' |__| '])	
		else
			markedPositions.push( [' |__| ',' |__| ',' |__| ',' |__| ',' |__| ',' |__| ', ' |__| ',' |__| '])
	}
	return markedPositions
}


let highlighted = [ ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'], 
					['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'], 
					['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
					['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
					['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
					['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
					['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
					['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'] ]

const io = socketio(server)

let players = []
let whoseTurn = []
let playersBoards = []

function flip(oneList, playerValue, otherPlayerValue, indList)
{
	let i = 0
	let distance = 10
	let spliceFromHere = 0

	oneList.forEach(one =>
	{
		if (one === playerValue)
		{
			if ( distance > Math.abs(indList - i) && Math.abs(indList - i) !== 1) 
			{
				distance = Math.abs(indList - i)
				spliceFromHere = i
			}
		}
		i++
	})
	let min =  Math.min(indList, spliceFromHere)
	let subList = []
	if ( (oneList.filter(val => val === playerValue)).length > 0 )
		subList = oneList.slice( min + 1, min + Math.abs( indList - spliceFromHere))
	if ( subList.every( val => val === otherPlayerValue )  && subList.length > 0 )
		return  oneList.slice(0, min + 1).concat(subList.map(val => playerValue) ).concat(oneList.slice(min + 1 + subList.length ) )
	return []
}


const fillBoard = (row, column, diagonalLeft, diagonalRight, [x,y], compareWith, otherIndex, socket, indexes, playerValue) =>
{
	if (row.length > 0)
		playersBoards[compareWith][x] = row
	if (column.length > 0)
		indexes.forEach(index => playersBoards[compareWith][index][y] = column[index])
	indexes.forEach(indexX => 
	{
		indexes.forEach(indexY => 
		{
			if (indexX - x === indexY - y && diagonalLeft.length > 0)
				playersBoards[compareWith][indexX][indexY] = diagonalLeft.splice(0, 1)[0]
			if (  (indexX - x) + (indexY - y) === 0 && diagonalRight.length > 0 )
				playersBoards[compareWith][indexX][indexY] = diagonalRight.splice(0, 1)[0]

		})
	})
	playersBoards[compareWith][x][y] = playerValue
	socket.emit('play_game', [playersBoards[compareWith], highlighted])
	players[otherIndex].emit('play_game',[playersBoards[compareWith], highlighted])
	whoseTurn[compareWith] = !whoseTurn[compareWith]
}


function isValid(myx, myy , x, y, playerValue, socket, compareWith, index, otherIndex, indexes) 
{
	if (players[players.length - 1] == socket && players.length % 2 != 0 ) 
		return false

	if (playersBoards[compareWith][x][y] === ' |__| ')
	{			
		let indexes = [0,1,2,3,4,5,6,7]
		let otherPlayerValue = ''
		playerValue === ' | X| ' ? otherPlayerValue = ' | O| ' : otherPlayerValue = ' | X| '
		let row = flip(playersBoards[compareWith][x], playerValue, otherPlayerValue, y) 
		let column = flip( playersBoards[compareWith].map( val => val[y] ), playerValue, otherPlayerValue, x ) 
		let diagonalLeft = []
		let diagonalRight = []
		let leftIndex = 0 // FML FML FML
		let rightIndex = 0
		indexes.forEach(indexX => 
		{
			indexes.forEach(indexY => 
			{
				if (indexX - x === indexY - y)
					diagonalLeft.push(playersBoards[compareWith][indexX][indexY])
				if (  (indexX - x) + (indexY - y) === 0 )
					diagonalRight.push(playersBoards[compareWith][indexX][indexY])
				if (indexX === x && indexY === y)
				{
					rightIndex = diagonalRight.length
					leftIndex = diagonalLeft.length - 1
				}
			})

		})
		diagonalLeft = flip(diagonalLeft, playerValue, otherPlayerValue, leftIndex)
		diagonalRight = flip(diagonalRight.reverse(), playerValue, otherPlayerValue, diagonalRight.length - rightIndex).reverse()
		if (row.length == 0 & column.length == 0 && diagonalRight.length == 0 && diagonalLeft.length == 0)
			return false
		else		
		{
			if (x === myx && y === myy)
			{
				fillBoard(row, column, diagonalLeft, diagonalRight, [x, y], compareWith, otherIndex, socket, indexes, playerValue)
				boardFull(socket, compareWith, playerValue, otherPlayerValue, otherIndex)
				// update mongo database

			}
			return true
		}
	}
	return false
}

const boardFull = (socket, compareWith, playerValue, otherPlayerValue, otherIndex) =>
{
	let empty = 0, mine = 0, other = 0
	playersBoards[compareWith].forEach(oneRow => empty += oneRow.filter(val => val === ' |__| ' ).length )
	if (!empty)
	{
		playersBoards[compareWith].forEach(oneRow => mine += oneRow.filter(val => val === playerValue ).length )
		playersBoards[compareWith].forEach(oneRow => other += oneRow.filter(val => val === otherPlayerValue ).length )
		if (mine > other)
		{
			console.log('PLAYER ' + playerValue + ' WINS!!!')
			socket.emit('win')
			players[otherIndex].emit('loose')
		}
		else
		{
			console.log('PLAYER ' + otherPlayerValue + ' WINS!!!')
			socket.emit('win')
			players[otherIndex].emit('loose')
		}
		players = players.filter(s => s !== socket && s !== players[otherIndex]) 
	}
}

function allValid (playerValue, socket, compareWith, index, otherIndex)
{
	var indexes = [0,1,2,3,4,5,6,7]
	flag = false
	indexes.forEach(i =>
	{
		indexes.forEach(j =>
		{
			if (playersBoards[compareWith][i][j]  === ' |__| ')
			{
				if (isValid(-1, -1, i, j, playerValue, socket, compareWith, index, otherIndex) )
					flag = true
			}
		})
	})
	return flag
}

io.sockets.on('connection', socket => 
{
	try
	{
		players = [...players, socket]
		if (players.length % 2 == 0)
		{
			playersBoards.push(generateBoard())
			whoseTurn.push(0)
		}

		// initialize the needed variables
		players.length % 2 == 0 ? socket.emit('give_value', ' | X| ') : socket.emit('give_value', ' | O| ')

		let index = players.indexOf(socket)
		let otherIndex = index + 1
		if (index % 2 != 0)
		{
			otherIndex -= 2
			index--
		}

		let compareWith = index - (index / 2) 

		socket.emit('play_game', [generateBoard(), highlighted])

		socket.on('check_validity', ([x, y, playerValue] ) =>
		{
			if (isValid(-1, -1, x, y, playerValue, socket, compareWith, index, otherIndex))
			{
				highlighted[x][y] = 'red'
				socket.emit('play_game', [playersBoards[compareWith], highlighted])		
			} 
		})

		socket.on('reset_color', ([x, y]) =>
		{
			highlighted[x][y] = 'black'
			socket.emit('play_game', [playersBoards[compareWith], highlighted])	
		})

		socket.on('make_move', async ([x, y, playerValue]) =>
		{
			if (players.indexOf(socket) % 2 == whoseTurn[compareWith])
			{
				if ( allValid(playerValue, socket, compareWith, index, otherIndex ) )				
					isValid(x, y, x, y, playerValue, socket, compareWith, index, otherIndex ) 
				else
				{
					socket.emit('loose')
					players[otherIndex].emit('win')
				}
			}
		})
		socket.on('disconnect', () => 
		{ 
			socket.emit('loose')
			players[otherIndex].emit('win')

		})
	} catch (err)
	{
		console.log('here!')
		console.error(err)
	}
})

server.listen(8000)

/*
Part 1: Two player Reversi using socket.IO.
Start game when second player joins.
Take care of “turn” and allow valid moves only. 
You do not need images and can just show which player is occupying a box by a character like “X” and “O”. 
Do not proceed without making this part work correctly.
*/


/*
Part 2: Win/Lose identification. Note that the game can end before all boxes are filled because one player is left with no valid move. 
*/