const parse5 = require('parse5')
const fs = require('fs')
const https = require('https')
const http = require('http')
const url = require('url')
const Q = require('q')
const _ = require('underscore')

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
var parser = new parse5.SAXParser()

const readFile = file => new Promise( (resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data)))


const readSite = link => new Promise ( (resolve, reject) => 
{
	let lib = link.startsWith('https') ? require('https') : require('http')
	//console.log('link is: ' + link) 
	lib.get(link, response => 
	{
		siteInfo[link].requestCount++
		resolve(response)
		reject(err => console.error(err))
	})
})



var siteInfo = {}
var siteNames = []
const fr = readFile(fileName).then(data =>
{
	obj = JSON.parse(data)

	obj.initialUrls.forEach(oneUrl => 
	{
		siteInfo[oneUrl] = {requestCount: 0}
		siteNames.push(oneUrl)
	})
}).catch(err => console.error(err))



let outgoingLinks = []

parser.on('startTag', (a, b) => 
{
	//console.log(a)
	//console.log(b)
	if (Array.isArray(a))
		outgoingLinks = outgoingLinks.concat(a.filter(att => att.name == 'href'))
	if (Array.isArray(b))
		outgoingLinks = outgoingLinks.concat(b.filter(att => att.name == 'href'))
	/*if (a == 'a')
	{
		//console.log(url.parse(b[0].value).hostname)
		//console.log('here???')
		//console.log(b)
		console.log('umm here?')
		outgoingLinks = outgoingLinks.concat(b.filter(att => att.name == 'href'))
	}
	else if (b == 'a')
	{
		//console.log('and here?')
		outgoingLinks = outgoingLinks.concat(a)
	}*/
})

bleh = [ 'https://www.quora.com/', 'http://www.espncricinfo.com/']

var answer = {}

const parseSites = siteNames => 
	Promise.all(siteNames.map(async oneSite => {
		try
		{
			const newPar = new parse5.SAXParser()
			console.log('site name: ' + oneSite)
			const response = await readSite(oneSite)
			/*response.pipe(newPar)
			newPar.on('startTag', (a, b) ) 
			{
				console.log(a)
				console.log(b)
				if (Array.isArray(a))
					outgoingLinks = outgoingLinks.concat(a.filter(att => att.name == 'href'))
				if (Array.isArray(b))
					outgoingLinks = outgoingLinks.concat(b.filter(att => att.name == 'href'))
			}
			console.log('WHAT???')*/
			//answer = answer.concat(response)
			answer = _.extend(response, answer)
			console.log('extended!')
			//console.log(answer)
		}
		catch (err)
		{
			err => console.error(err)
		}
	}))


/*fr.then(  () => parseSites(siteNames) ) //pass the html data of all sites into one variable
	.then( () => Promise.all(answer.map( oneSite =>  //pipe all the data
	{
		console.log('GOING TO PARSE')
		var parsed = oneSite.pipe(parser) 
		parsed.on('finish', () => console.log('YAYYYYYY ' + outgoingLinks))
	} ) ) ) */

const shixx = outgoingLinks =>
	//console.log(outgoingLinks)
	outgoingLinks.forEach(oneLink =>
	{
		//console.log('why')
		//console.log( oneLink)
		//console.log('GOING TO OBSERVE THE LINK ' + oneLink)
		//console.log(url.parse(oneLink.value).pathname)
	})

/*const extractData = siteNames => parseSites(siteNames).
	then( () => {

	Promise.all(answer.map( oneSite => {
		//console.log('looking for site ' + oneSite)
		console.log(oneSite)
		parser = new parse5.SAXParser()
		parsed = oneSite.pipe(parser) 
		parsed.on('finish', () => 
		{
			console.log('PARSED!!!')
			console.log(outgoingLinks)
		})
	} ) ) }  )*/

const extractData = siteNames => parseSites(siteNames).
	then( () => {
		let parsed = answer.pipe(parser)
		parsed.on('finish', () => 
		{
			console.log('PARSED!!!')
			console.log(outgoingLinks)
		})
	} )

fr.then(() => extractData(siteNames))



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






const delay = msecs => new Promise(resolve => setTimeout(resolve, msecs)) //give resolve after secs

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

/*
parser.on('startTag', (a, b) => 
{
    console.log(a)
    console.log(b)
    if (a == 'a')
    {
        console.log(a)
        //a.href = b.
        console.log(url.parse(b[0].value).hostname)
    }
    else if (b == 'a')
        console.log(b)
});


http.get('http://google.com', res => 
{
   res.pipe(parser)
});

*/