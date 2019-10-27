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
let count = 1

const parseSites = (parser, response, currentSite) => new Promise( (resolve, reject) => 
{
	//console.log('IN PARSE SITES!')
	const parsed = response.pipe(parser)
	parsed.on('finish', () => goTolink(outgoingLinks, currentSite).then( () =>
	{
		//console.log('PARSE SITES RESOLVED! <3')
		resolve()
	}))

	parser.on('startTag', (a, b) => 
	{
		if (a === 'a')
			outgoingLinks = outgoingLinks.concat( b.filter(att => att.name === 'href') )
	})
})


// for each in the map...
// then... promise.all for the promise delay... 
// you process one link... you have to have a list of incoming links and outgoing links for that domain...
// so for one link, you identify the domain, outgoing links are easliy done just copy promise delay list in that
// handle incoming links indirectly. meaning for domain A see outgoing links. for each domain in those links add your current
// domain/link to their incoming link. FML. 




const getSites = (siteNames, waitFor) => new Promise( (resolve, reject) =>
{
	if (siteNames.length === 0 || (numRequests >= obj.maxRequests))
		resolve()
	Promise.all(siteNames.map(oneSite => new Promise( (resolve, reject) =>
	{
		//console.log('will process ' + oneSite)
		readSite(oneSite, waitFor).then(response => 
		{
			numRequests++
			//console.log('HAVE READ SITE ' + oneSite + ' ' + numRequests)
			if (numRequests > obj.maxRequests)
			{
				//console.log('Need to resolve! ' + oneSite + ' ' + numRequests)
				siteNames = []
				resolve()
			}
			var parser = new parse5.SAXParser()
			parseSites(parser, response, oneSite).then( () =>  
			{
				//console.log('THE SITE HAS BEEN RESOLVED! <3 ' + oneSite + ' ' + numRequests)			
				//console.log(`Site ${oneSite} num ${numRequests} max ${obj.maxRequests}`)
				//console.log(siteNames)
				resolve()
			}).catch(err => console.error(err))
		})
	}) ) ).then ( () =>
	{
		//console.log('ONE ARRAY OF OUTLINK HAS BEEN PROCESSED! <3')
		getSites(siteNames, waitFor).then( () => 
		{
			//console.log('ITS CHILDREN HAVE BEEN RESOLVED')
			//console.log(siteNames)
			resolve()
		})
	})
})

fileRead.then(() => getSites(siteNames, 1000)).then( async () => 
{
	console.log('OMG ALL DONE! <3')
	//await delay(5000)
	console.log(finalIndex)
} )


const goTolink = (outgoingLinks, currentSite) => new Promise( (resolve, reject) =>
{
	//siteNames = []
	outgoingLinks = outgoingLinks.map(att => att.value)
	//console.log(siteNames)
	outgoingLinks.forEach(oneLink =>
	{		
		let exists = false
		let domainNameOfLink = url.parse(oneLink).host 
		let domainNameOfSite = url.parse(currentSite).host 
		//console.log(`domainNameOfLink ${domainNameOfLink} domainNameOfSite ${domainNameOfSite}`)
		if ( domainNameOfLink != null && !(domainNameOfLink.includes(domainNameOfSite))) //then domainNameOfSite is the right domain here
		{
			if (domainNameOfSite in finalIndex)
			{
				if (finalIndex[domainNameOfSite].outgoing.indexOf(domainNameOfLink) === -1)
				{
					//console.log('Adding ' + domainNameOfLink + ' as an outlink to ' + domainNameOfSite)
					finalIndex[domainNameOfSite].outgoing.push(domainNameOfLink) 
				}
			}
			else
			{
				//console.log('!Adding ' + domainNameOfLink + ' as an outlink to ' + domainNameOfSite)
				finalIndex[domainNameOfSite] = {outgoing:[domainNameOfLink], incoming: []} 
			}

			if (domainNameOfLink in finalIndex)
			{
				if (finalIndex[domainNameOfLink].incoming.indexOf(domainNameOfSite) === -1)
				{						
					//console.log('Adding ' + domainNameOfSite + ' as an inlink to ' + domainNameOfLink)
					finalIndex[domainNameOfLink].incoming.push(domainNameOfSite) 
				}
			}
			else
			{
				//console.log('!Adding ' + domainNameOfSite + ' as an inlink to ' + domainNameOfLink)
				finalIndex[domainNameOfLink] = {outgoing:[], incoming: [domainNameOfSite]}
			}
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
						{
							//console.log('ADDING... ' + oneLink)
							siteNames.push(oneLink)
						}
					}
				}

			})
			if (exists === false )
			{
				//numRequests++
				siteInfo[domainNameOfLink] = {requestCount: 1, promisedDelay: [oneLink]}
				if (siteNames.indexOf(oneLink) === -1)
				{
					//console.log('ADDING2... ' + oneLink)
					siteNames.push(oneLink)
				}
			}
		}			
	})
	//console.log('GONNA DO IT! ' + currentSite)
	siteNames.splice( siteNames.indexOf(currentSite) , 1)
	outgoingLinks = []
	resolve()
})
	// the outlinks are now collected
	// now u call these links... meaning do something like:
	// (make function of the following)
	// promise.all(requestQue => for all links in the request que, call each. AFTER A DELAY. 
	// do the 'then' when the recursion starts back-tracking)
	// 1. fucking delay isn't working
	// 2. remove links you've already visited


// when u collect the outlinks... your one task is done. So in the then statement of this 'promise', you call these links...
// and those links will have their own outlinks and after they've been collected you will call them one by one
// this will go on until there are no promises in the requestQue and then in the .then handler of the promise.all you will print the
// relavent info out. So, okay, there are two ways the requesQue will be empty: i) there are no more outlinks
// ii) the max request limit has been reached(more likely) 


// Every time you make a request you will use a promise 
// that resolves when the response ends and you chain another promise to
// it that will resolve after a set amount of time and store it in this
// map so further requests can be chained to this promised delay.





// For each of the URLs in the initialURLs and afterwards when you find 
// new URLs, you will separate the domain name, and if it is less than max 
// requests for that site, attach the next request to the 'then' handler of 
// promisedDelay and also attach a delay promise. Use the following delay 
// function that returns a promise // so after the delay you let the next
					   		  // promise be resolved...?







// For fetching, write a promise based fetch function that uses http.get 
// or https.get based on the URL. Once you get the response you will pipe 
// it to parse5 (http://inikulin.github.io/parse5/classes/saxparser.html) 
// and in the startTag handler of parser, you find if it is an "A" tag. If 
// so, you take the "href" attribute. This is an outgoing URL. If it starts 
// with "//" it means use http:// or https:// based on the current page's 
// URL. If it starts with any alphabets followed by :// you discard it 
// except when it is http or https. Finally, if it starts with "/" it is an 
// absolute URL and it means to attach the whole http://domainNameOfLink before 
// it and in other cases, it is a relative URL and you attach 
// http://domainNameOfLink/currentpage/ before it.
// 
// At the end, you have to print a list of all domains encountered 
// along with the number of distinct domains that have a page with a link to 
// a page on this domain (incoming links from distinct  domains) and the 
// number of distint domains linked to by this domain (outgoing links to 
// distinct domains)
// 
// Here is one way to divide your work.
//
// Step 1: Read and parse config.json
// Step 2: Download URLs listed in config.json
// Step 3: Obey delay and limit per site and max URLs to fetch
// Step 4: Extract outgoing links from webpages and add to request queue
// Step 5: Maintain and print list of domains with counts
