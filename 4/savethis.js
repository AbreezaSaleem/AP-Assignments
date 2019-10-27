const socket = io()

// the player connects 
// is given the first turn (if he's the first? idk. i'll set the flag value accordingly)
// write code to allow valid movements only <---- shitty job
// dont know what to do now
// make an interface. i.e do the createElement wali thingy. 
// make form. in the on-submit's fucntion check if the move is valid. (what if it's not?)
// make the submit button. guess this is the only thing u can do
// umm map yo moves to a div?

let markedPositions = [ [0,0,0,0,0,0,0,0], [], [], [], [], [], [], []]

const handleClick = (data) =>
{
	console.log('YOU CLICKED <3 ' + data +'!!!')
	//().preventDefault()
	socket.emit('to_server', 'you clicked!')
}

function redraw()
{
	ReactDOM.render(React.createElement('h1', {},
		React.createElement('p', {}, 'LETS PLAY REVERSI! <3'),
			React.createElement('div', {className: '1'}, 
				React.createElement('span', {onClick: () => handleClick(1, 1), className: '1x1'}, '[ ]'),
				React.createElement('span', {onClick: () => handleClick(1, 2), className: '1x2'}, '[ ]'), 
				React.createElement('span', {onClick: () => handleClick(1, 3), className: '1x3'}, '[ ]'),
				React.createElement('span', {onClick: () => handleClick(1, 4), className: '1x4'}, '[ ]'),
				React.createElement('span', {onClick: () => handleClick(1, 5), className: '1x5'}, '[ ]'),
				React.createElement('span', {onClick: () => handleClick(1, 6), className: '1x6'}, '[ ]'), 
				React.createElement('span', {onClick: () => handleClick(1, 7), className: '1x7'}, '[ ]'),
				React.createElement('span', {onClick: () => handleClick(1, 8), className: '1x8'}, '[ ]')  ),
			React.createElement('div', {className: '2'}, 
				React.createElement('span', {onClick: handleClick(21), className: '2x1'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(22), className: '2x2'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(23), className: '2x3'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(24), className: '2x4'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(25), className: '2x5'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(26), className: '2x6'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(27), className: '2x7'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(28), className: '2x8'}, '[ ]')  ),
			React.createElement('div', {className: '3'}, 
				React.createElement('span', {onClick: handleClick(31), className: '3x1'}, '[ ]')
				React.createElement('span', {onClick: handleClick(32), className: '3x2'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(33), className: '3x3'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(34), className: '3x4'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(35), className: '3x5'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(36), className: '3x6'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(37), className: '3x7'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(38), className: '3x8'}, '[ ]') ),
			React.createElement('div', {className: '4'}, 
				React.createElement('span', {onClick: handleClick(41), className: '4x1'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(42), className: '4x2'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(43), className: '4x3'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(44), className: '4x4'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(45), className: '4x5'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(46), className: '4x6'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(47), className: '4x7'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(48), className: '4x8'}, '[ ]')  ),
			React.createElement('div', {className: '1'}, 
				React.createElement('span', {onClick: handleClick(51), className: '1x1'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(52), className: '1x2'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(53), className: '1x3'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(54), className: '1x4'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(55), className: '1x5'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(56), className: '1x6'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(57), className: '1x7'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(58), className: '1x8'}, '[ ]')  ),
			React.createElement('div', {className: '2'}, 
				React.createElement('span', {onClick: handleClick(61), className: '2x1'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(62), className: '2x2'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(63), className: '2x3'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(64), className: '2x4'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(65), className: '2x5'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(66), className: '2x6'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(67), className: '2x7'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(68), className: '2x8'}, '[ ]')  ),
			React.createElement('div', {className: '3'}, 
				React.createElement('span', {onClick: handleClick(71), className: '3x1'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(72), className: '3x2'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(73), className: '3x3'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(74), className: '3x4'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(75), className: '3x5'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(76), className: '3x6'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(77), className: '3x7'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(78), className: '3x8'}, '[ ]') ),
			React.createElement('div', {className: '4'}, 
				React.createElement('span', {onClick: handleClick(81), className: '4x1'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(82), className: '4x2'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(83), className: '4x3'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(84), className: '4x4'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(85), className: '4x5'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(86), className: '4x6'}, '[ ]'), 
				React.createElement('span', {onClick: handleClick(87), className: '4x7'}, '[ ]'),
				React.createElement('span', {onClick: handleClick(88), className: '4x8'}, '[ ]')  ) )  ,
	document.getElementById('root') )
}


redraw()

// wtf is ev
// wtf is ev.preventDefault?
// learn how div works
// learn how createElement works


// okay now, player 1 plays. It makes a 'valid' move (make a function checking if the move is valid)
// i.e you update the list containing which position is filled by which player
// get input from player... how? so umm when you're waiting for the input you do the await thingy??? 
// createElement. 'input'. 'type' will be click...?
// when you click, you get the value (cout it to see what you get). then you update your list. later
// you map the click values to a div. 



const getInput = () =>
{
	React.createElement('input', {onClick: handleClick})
}

getInput()


/*
Part 1: Two player Reversi using socket.IO.
Start game when second player joins.
Take care of “turn” and allow valid moves only. 
You do not need images and can just show which player is occupying a box by a character like “X” and “O”. 
Do not proceed without making this part work correctly.
*/