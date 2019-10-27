const socket = io()

let playerValue = ''
socket.on('give_value', data => playerValue = data )


// since we're not allowed to use document.getElementBuId...


const handleClick =  (x, y) =>
{
	console.log('YOU CLICKED ' + x + ' ' + y  +'!!!')
	socket.emit('make_move', [x, y, playerValue] )
}

const checkValidity = (x, y) => socket.emit('check_validity', [x, y, playerValue]) 

const leave = (x, y) => socket.emit('reset_color', [x, y]) // flip the highlight back to normal. such a fml code

socket.on('play_game', ([markedPositions, highlighted]) =>
{
	console.log('gonna update ')
	ReactDOM.render( React.createElement( root, {markedPositions, highlighted} ), document.getElementById('root') )
} )

const root = ({markedPositions, highlighted}) =>
	React.createElement('h1', {}, 
		React.createElement('p', {}, 'LETS PLAY REVERSI! <3'),
		markedPositions.map(oneColumn => 
			React.createElement('div', {},
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][0]}, 
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 0) , 
					onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 0) , 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 0)}, oneColumn[0]),
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][1]}, 
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 1),
				 	onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 1), 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 1)}, oneColumn[1]),
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][2]},
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 2),
					onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 2), 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 2) }, oneColumn[2]),
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][3]},
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 3),
					onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 3), 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 3) }, oneColumn[3]),
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][4]},
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 4),
					onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 4), 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 4) }, oneColumn[4]),
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][5]},
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 5),
					onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 5), 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 5) }, oneColumn[5]),
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][6]},
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 6),
					onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 6), 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 6) }, oneColumn[6]),
				React.createElement('span', {style: {color:highlighted[markedPositions.indexOf(oneColumn)][7]},
					onClick: () => handleClick(markedPositions.indexOf(oneColumn), 7),
					onMouseOver: () => checkValidity(markedPositions.indexOf(oneColumn), 7), 
					onMouseOut: () => leave(markedPositions.indexOf(oneColumn), 7) }, oneColumn[7])   )
		),
		React.createElement('h1', {}, '*************') )


ReactDOM.render( React.createElement('h1', {}, 'LETS PLAY REVERSI! <3') , document.getElementById('root'))

socket.on('win', data => ReactDOM.render( React.createElement('h1', {}, 'YOU WON :D') , document.getElementById('root') ) )
socket.on('loose', data => ReactDOM.render( React.createElement('h1', {}, 'YOU LOOSE :(') , document.getElementById('root') ) )

//socket.on('win', () => socket.disconnect())
//socket.on('loose', () => socket.disconnect() )



/*
Part 1: Two player Reversi using socket.IO.
Start game when second player joins.
Take care of “turn” and allow valid moves only. 
You do not need images and can just show which player is occupying a box by a character like “X” and “O”. 
Do not proceed without making this part work correctly.
*/