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
	lib.get(link, response => 
	{
		numRequests++
		const done = delay(waitFor).then( () =>
		{		
			resolve(response)
			reject(err => console.error(err))	
		})
	})
})

const parseDone = (count, currentSite, length) => new Promise ( (resolve, reject) => // it'll only resolve in the case when goToLink is called and that resolves...
{																			// so for other cases... it'll give reject... but thats okay...
	if (length == count)
	{
		console.log('GOING TO GOL!')
		goTolink(outgoingLinks, currentSite).then( () =>
		{
			console.log('PARSE DONE RESOLVED! <3')
			resolve()
		}).catch(err => console.error(err))
	}
})


let outgoingLinks = []
let count = 1

const parseSites = (parser, response, currentSite, length) => new Promise( (resolve, reject) =>
{
	//console.log('IN PARSE SITES!')
	const parsed = response.pipe(parser)
	parsed.on('finish', () => parseDone(count++, currentSite, length).then( () => 
	{
		console.log('PARSE SITES RESOLVED! <3')
		resolve() 
	}).catch( () => console.log('you gotta wait...')) )

	parser.on('startTag', (a, b) => 
	{
		if (a == 'a')
		{
			b.forEach(oneLink =>
			{
				if (oneLink.name == 'href')
				{
					if (oneLink.value[0] == '/')
						oneLink.value = currentSite + oneLink.value
					outgoingLinks = outgoingLinks.concat(oneLink.value)
				}
			})
		}
	})
})


// for each in the map...
// then... promise.all for the promise delay... 
// you process one link... you have to have a list of incoming links and outgoing links for that domain...
// so for one link, you identify the domain, outgoing links are easliy done just copy promise delay list in that
// handle incoming links indirectly. meaning for domain A see outgoing links. for each domain in those links add your current
// domain/link to their incoming link. FML. 


const getSites = (siteInfo, waitFor) => new Promise( (resolve, reject) =>
{
	console.log('IN GET SITES! ')
	console.log(siteInfo)
	let length = 0
	Object.keys(siteInfo).forEach(key => length += siteInfo[key].promisedDelay.length ) 
	Object.keys(siteInfo).forEach(key =>
	{
		(siteInfo[key].promisedDelay).forEach(async oneSite => 
		{
			try
			{
				const response = await readSite(oneSite, waitFor)
				var parser = new parse5.SAXParser()
				siteInfo[key].promisedDelay.splice( siteInfo[key].promisedDelay.indexOf(oneSite) ,  1)
				parseSites(parser, response, oneSite, length).then( () =>
				{
					console.log('GET SITES RESOLVED! <3 ' + oneSite)
					//console.log(numRequests)
					//console.log(siteInfo)
					resolve()
				}).catch( () => console.log('wait...') )
			} catch (err)
			{
				err => console.error(err)
			}
		})
	})
})

fileRead.then(() => getSites(siteInfo, 1000)).then( () => 'HELL YEAWWWWWW ALL RESOLVED!!!')


const goTolink = (outgoingLinks, currentSite) => new Promise( (resolve, reject) =>
{
	console.log('IN GO TO LINK!')
	console.log(siteInfo)
	if (numRequests <= obj.maxRequests && outgoingLinks.length >= 0)
	{
		outgoingLinks.forEach(oneLink =>
		{		
			let exists = false
			let domainName = url.parse(oneLink).host 
			if (domainName != null)
			{
				Object.keys(siteInfo).forEach(key => 
				{
					newKey = key.replace('https:/', '').replace('http:/', '').replace('/', '').replace('/', '').replace('www', '')
					if( domainName.includes(newKey) ) //lums.edu.pk is calling another website in itself! Thats a LAME way to say it Abreeza...
					{
						exists = true
						if(siteInfo[key].requestCount < obj.maxRequestsPerSite)
						{
							//numRequests++
							siteInfo[key].requestCount++;
							siteInfo[key].promisedDelay.push(oneLink)
						}
					}

				})
				if (exists == false )
				{
					//numRequests++
					siteInfo[domainName] = {requestCount: 1, promisedDelay: [oneLink]}
				}
			}
			// if num requests have passed or if outgoing links are 0 you resolve the function
			// otherwise, collect the relevant links and pass them to get sites. after get sites has been processed, you resolve this function too

		})
		console.log('GONNA CALL GET SITES AGAIN!')
		getSites(siteInfo, obj.minFetchInterval).then( () =>
		{
			/*console.log('\n')
			console.log('numRequests: ' + numRequests)
			console.log('siteInfo')
			console.log(siteInfo)*/
			console.log('GET SITES IS RESOLVED IN THE LOOP!')
			resolve()
			reject()
		}).catch(err => console.error(err))
	}
	else
	{		
		console.log('GET LINK RESOLVED! <3 ' + numRequests + ' ' + outgoingLinks.length)
		resolve()	
	}
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


// Maintain a map of how many requests you have made to each site and the 
// last promised Delay like this. This is just an example. You will not
// hardcode values. Every time you make a request you will use a promise 
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
// absolute URL and it means to attach the whole http://domainname before 
// it and in other cases, it is a relative URL and you attach 
// http://domainname/currentpage/ before it.
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
