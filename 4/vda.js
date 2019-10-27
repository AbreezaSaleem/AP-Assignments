const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')

const readFile = file => new Promise( (resolve, reject) => 
	fs.readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data)) )


const server = http.createServer(async (request, respose) =>
{
	try
	{
		respose.end(await readFile(request.url.substr(1)))
	} catch (err)
	{
		respose.end()
	}
})

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

const io = socketio(server)

let players = []
let whoseTurn = 0

io.sockets.on('connection', socket => {
	players = [...players, socket]
	players.length % 2 == 0 ? players[players.length - 1].emit('give_value', 'X') : players[players.length - 1].emit('give_value', 'O')

	
	if (players.length % 2 == 0)
	{
		console.log('LET THE GAMES BEGIN!')
		players[players.length - 1].emit('play_game', markedPositions)
		players[players.length - 2].emit('play_game', markedPositions)
		//socket.emit('play_game', markedPositions)
		socket.on('to_server', ([x, y]) =>
	{
		console.log('data is: ' + x + ' ' + y)
		console.log(players.length)
	} )

		socket.on('make_move', ([x, y]) =>
		{
			console.log('PLAYER MADE A MOVE! ' + x + ' ' + y )
			if (players.indexOf(socket) % 2 === whoseTurn)
			{
				whoseTurn = !whoseTurn

			}
		})
	}
	else 
	{

	}
	socket.on('disconnect', () => 
	{
		// nth player left (n == even) n-1 is the winner! remove this one from the game too or ask to play again?
		// nth player left (n == odd) n + 1 is the winner! same as above 
		players = players.filter(s => s !== socket) 

	})


})

server.listen(8000)

/*
Part 1: Two player Reversi using socket.IO.
Start game when second player joins.
Take care of “turn” and allow valid moves only. 
You do not need images and can just show which player is occupying a box by a character like “X” and “O”. 
Do not proceed without making this part work correctly.
*/


