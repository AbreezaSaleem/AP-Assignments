const socket = io()

/*let markedPositions = []
for (let i = 0; i < 8; i++)
{
	markedPositions.push( ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'])
}*/

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

const create = React.createElement;

const handleClick = (a, b) =>
{
	console.log('YOU CLICKED <3' + a + ' ' + b  +'!!!')
	//ev.preventDefault()
	socket.emit('to_server', 'you clicked!')
}


const root = ({markedPositions}) =>
	React.createElement('h1', {}, 
		React.createElement('p', {}, 'LETS PLAY REVERSI! <3'),
		markedPositions.map(oneColumn =>  	
			React.createElement('div', {},  oneColumn.map(oneElement => React.createElement('span', {
				onClick: () => handleClick(markedPositions.indexOf(oneColumn), oneColumn.indexOf(oneElement))
				}, oneElement) )  ) )
			,
		React.createElement('h1', {}, '*************') )


ReactDOM.render( React.createElement( root, {markedPositions} ), document.getElementById('root'))

/*ReactDOM.render( React.createElement( 'h1', {}, 
	[
		React.createElement('h2', {}, 
			[
				React.createElement('p', {}, 'letz'),
				React.createElement('p', {}, 'see')
			]),
		React.createElement('p', {}, 'hallo'),
		React.createElement('p', {}, 'hoiz')
	] ), document.getElementById('root'))
*/

/*
const root = ({markedPositions}) =>
	React.createElement('h1', {}, 
		React.createElement('p', {}, 'LETS PLAY REVERSI! <3'),
		markedPositions.map(oneRow => {
			React.createElement('div', {}, React.createElement(rowButtons , { index: markedPositions.indexOf(oneRow) + 1 , row: oneRow}, null ) )
		}),
		React.createElement('h1', {}, '************************') )


*/