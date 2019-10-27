const socket = io()

/*let markedPositions = [ ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], 
						['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'],
						['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'],
						['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]'], ['[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]','[ ]']	]
*/
let markedPositions = []
for (let i = 0; i < 64; i++)
{
	markedPositions.push('--')
}
console.log(markedPositions)
const create = React.createElement;

const handleSubmit = (x, y) => console.log('x: ' + x + ' ' + y)

function rowButtons({index, row})
{
	console.log(index)
	console.log('?')
	row.map( oneElement => React.create('button', {onclick: () => handleSubmit( row.indexOf(oneElement) + 1 , index )}, oneElement ) )
	console.log('!')
}

function root({one, board})
{
	React.createElement('h1', {}, 'LETS PLAY REVERSI! <3')
	
	for (let i = 1; i <= 64; i += 8)
	{
		let col = Math.ceil(i / 8)
		React.createElement('div', {}, 
			React.createElement('button', {onclick: () => handleSubmit( i , col )}, board[i - 1] ),
			React.createElement('button', {onclick: () => handleSubmit( i + 1 , col )}, board[i] ),
			React.createElement('button', {onclick: () => handleSubmit( i + 2 , col )}, board[i + 1] ),
			React.createElement('button', {onclick: () => handleSubmit( i + 3 , col )}, board[i + 2] ),
			React.createElement('button', {onclick: () => handleSubmit( i + 4 , col )}, board[i + 3] ),
			React.createElement('button', {onclick: () => handleSubmit( i + 5 , col )}, board[i + 4] ),
			React.createElement('button', {onclick: () => handleSubmit( i + 6 , col )}, board[i + 5] ),
			React.createElement('button', {onclick: () => handleSubmit( i + 7 , col )}, board[i + 6] ) )
	}
	React.createElement('h1', {}, '************************')
}

ReactDOM.render( React.createElement(root, {one: 'pls', board: markedPositions}), document.getElementById('root') )


markedPositions.map(oneRow =>
		{
			let i = markedPositions.indexOf(oneRow) + 1
			React.createElement('div', {}, React.createElement(rowButtons , { index: i , row: oneRow}, null ) )
		}),











	