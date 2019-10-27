const parse5 = require('parse5')
const fs = require('fs')
const url = require('url')

// Assignment 3: Web crawler
// Deadline: Saturday 18 March at 9PM
//
// You will write a web crawler in this assignment. Make sure to not 
// send out too many requests. It is best to try on local sites and with
// a small limit on the number of requests. 
// 
// You will read the configuration from a file named 'config.json' in the 
// same directory. Here is a sample config.json. Use promises to read this
// file and JSON.parse to parse it. Do not add comments in config.json

var fileName = 'config.json'
let numRequests = 0

const delay = msecs => new Promise(resolve => setTimeout(resolve, msecs)) //give resolve after secs

const readFile = file => new Promise( (resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data)))


var siteInfo = {}
var siteNames = []
var finalIndex = {} //will have list of incoming link and list of outgoing links

const fileRead = readFile(fileName).then(data =>
{
	obj = JSON.parse(data)

	obj.initialUrls.forEach(oneUrl => 
	{
		siteNames.push(oneUrl)
		oneUrl = (oneUrl)
		siteInfo[oneUrl] = {requestCount: 1, promisedDelay: [oneUrl]}
	})
}).catch(err => console.error(err))


const readSite = (link, waitFor) => new Promise ( (resolve, reject) => 
{
	let lib = link.startsWith('https') ? require('https') : require('http')
	lib.get(link, async response => 
	{
		//await delay(waitFor)
		resolve(response)
		reject(err => console.error(err))	
		
	})
})


let outgoingLinks = []

const parseSites = (parser, response, currentSite) => new Promise( (resolve, reject) => 
{
	const parsed = response.pipe(parser)
	parsed.on('finish', () => goTolink(outgoingLinks, currentSite).then( () => resolve() ) )

	parser.on('startTag', (a, b) => 
	{
		if (a === 'a')
			outgoingLinks = outgoingLinks.concat( b.filter(att => att.name === 'href') )
	})
})


const getSites = (siteNames, waitFor) => new Promise( (resolve, reject) =>
{
	if (siteNames.length === 0 || (numRequests >= obj.maxRequests))
		resolve()
	Promise.all(siteNames.map(oneSite => new Promise( (resolve, reject) =>
	{
		readSite(oneSite, waitFor).then(response => 
		{
			numRequests++
			if (numRequests > obj.maxRequests)
			{
				siteNames = []
				resolve()
			}
			var parser = new parse5.SAXParser()
			parseSites(parser, response, oneSite).then( () =>  resolve() ).catch(err => console.error(err))
		})
	}) ) ).then ( () => getSites(siteNames, waitFor).then( () => resolve() ) )
})

fileRead.then(() => getSites(siteNames, 1000)).then( async () => 
{
	console.log('OMG ALL DONE! <3')
	console.log(finalIndex)
} )


const goTolink = (outgoingLinks, currentSite) => new Promise( (resolve, reject) =>
{
	outgoingLinks = outgoingLinks.map(att => att.value)
	outgoingLinks.forEach(oneLink =>
	{		
		let exists = false
		let domainNameOfLink = url.parse(oneLink).host 
		let domainNameOfSite = url.parse(currentSite).host 
		if ( domainNameOfLink != null && !(domainNameOfLink.includes(domainNameOfSite))) //then domainNameOfSite is the right domain here
		{
			if (domainNameOfSite in finalIndex)
			{
				if (finalIndex[domainNameOfSite].outgoing.indexOf(domainNameOfLink) === -1)
					finalIndex[domainNameOfSite].outgoing.push(domainNameOfLink) 
			}
			else
				finalIndex[domainNameOfSite] = {outgoing:[domainNameOfLink], incoming: []}

			if (domainNameOfLink in finalIndex)
			{
				if (finalIndex[domainNameOfLink].incoming.indexOf(domainNameOfSite) === -1)
					finalIndex[domainNameOfLink].incoming.push(domainNameOfSite) 
			}
			else
				finalIndex[domainNameOfLink] = {outgoing:[], incoming: [domainNameOfSite]}
		}

		if (oneLink[0] === '/') 
		{
			oneLink = currentSite + oneLink
			domainNameOfLink = currentSite
		}

		if (domainNameOfLink !== null)
		{
			Object.keys(siteInfo).forEach(key => 
			{
				newKey = key.replace('https:/', '').replace('http:/', '').replace('/', '').replace('/', '').replace('.www', '')
				if( domainNameOfLink.includes(newKey) ) //lums.edu.pk is calling another website in itself! Thats a LAME way to say it Abreeza...
				{
					exists = true
					if(siteInfo[key].requestCount < obj.maxRequestsPerSite)
					{
						siteInfo[key].requestCount++;
						siteInfo[key].promisedDelay.push(oneLink)
						if (siteNames.indexOf(oneLink) === -1)
							siteNames.push(oneLink)
					}
				}

			})
			if (exists === false )
			{
				siteInfo[domainNameOfLink] = {requestCount: 1, promisedDelay: [oneLink]}
				if (siteNames.indexOf(oneLink) === -1)
					siteNames.push(oneLink)
			}
		}			
	})
	siteNames.splice( siteNames.indexOf(currentSite) , 1)
	outgoingLinks = []
	resolve()
})

