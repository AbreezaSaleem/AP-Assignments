const socket = io()

// the player connects 
// is given the first turn (if he's the first? idk. i'll set the flag value accordingly)
// write code to allow valid movements only <---- shitty job
// dont know what to do now
// make an interface. i.e do the createElement wali thingy. 
// make form. in the on-submit's fucntion check if the move is valid. (what if it's not?)
// make the submit button. guess this is the only thing u can do
// umm map yo moves to a div?

let markedPositions = [ ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], 
						['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'],
						['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'],
						['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'],
						['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'],	]


const handleClick = (a, b) =>
{
	console.log('YOU CLICKED <3' + a + ' ' + b  +'!!!')
	//ev.preventDefault()
	socket.emit('to_server', 'you clicked!')
}

function redraw()
{
	ReactDOM.render(React.createElement('h1', {},
		React.createElement('p', {}, 'LETS PLAY REVERSI! <3'),
			React.createElement('div', {className: '1'}, 
				React.createElement('span', {onClick: () => handleClick(1, 1)}, markedPositions[0][0]),
				React.createElement('span', {onClick: () => handleClick(1, 2)}, markedPositions[0][1]), 
				React.createElement('span', {onClick: () => handleClick(1, 3)}, markedPositions[0][2]),
				React.createElement('span', {onClick: () => handleClick(1, 4)}, markedPositions[0][3]),
				React.createElement('span', {onClick: () => handleClick(1, 5)}, markedPositions[0][4]),
				React.createElement('span', {onClick: () => handleClick(1, 6)}, markedPositions[0][5]), 
				React.createElement('span', {onClick: () => handleClick(1, 7)}, markedPositions[0][6]),
				React.createElement('span', {onClick: () => handleClick(1, 8)}, markedPositions[0][7])  ) )  ,
	document.getElementById('root') )
}


redraw()

// wtf is ev
// wtf is ev.preventDefault?
// learn how div works
// learn how createElement works


// okay now, player 1 plays. It makes a 'valid' move (make a function checking if the move is valid)
// i.e you update the list containing which position is filled by which player
// get input from player... how? so umm when you're waiting for the input you do the await thingy??? no i think it'll be done when p1 waits for p2
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