// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const d3 = require('d3')
let bluebird = require('bluebird')
const $ = require('jquery')
const readdir = bluebird.promisify(require('fs').readdir);
const readFile = bluebird.promisify(require('fs').readFile);
const reduceXY = require('./utils').reduceXY
const correlation = require ('./utils').correlation
const imgToCSV = require('./utils').imgToCSV
const Tesseract = require('tesseract.js')

//set height and width of chart
const h = 255;
const w = 480;
const padding = 20;
let dataIMG = '';


readdir(__dirname + '/data')
	.then((data) =>{

		data.forEach( (fileName) =>{

				$('#previous-photos').append(`<li value=${fileName}> <img  class='img-thumbnail select-pic' src='${__dirname}/data/${fileName}' </li>`)
				$('#data-set').append(`<option value=${fileName}> ${fileName.split('.')[0]} </option>`)
			})

	})



$('#previous-photos').on('click','li', (e)=>{
		targetValue = String($(e.target).parent()[0].value) + '.png'

		$('#image-display').empty()
		$('#image-display').append($(`<img src="data/${targetValue}" alt="your data" height="10%" width="10%">`))
		dataIMG = targetValue
});

$('#graph').on('click', (e) => {
$('svg').remove()
$('#chart-space').addClass('loading')
$('#correlation').remove()


readFile(__dirname+`/data/${dataIMG}`)
.then ( result => {


return 	Tesseract.recognize(result).progress(function (p) {console.log('progress', p)})

})

.then(recogIMG =>{

	stats = imgToCSV(recogIMG)
	return d3.csvParse(stats)
})
.then( stats => {
	$('#chart-space').removeClass('loading')

	//scrub data using helper function
	console.log('pre-reducexy', stats)
	stats = stats.map(object => {
		return reduceXY(object, stats.columns[0], stats.columns[1], stats.columns[2])
	})

	console.log("Scrubbed Stats", stats)
	//Using d3 methods min and max, get the maximum and minimum from the data set
	let xRange= [
	d3.min(stats, function(data){
		return data.x
	}),
	d3.max(stats, function(data){
		return data.x
	})
	]

	let yRange= [
	d3.min(stats, function(data){
		return data.y
	}),
	d3.max(stats, function(data){
		return data.y
	})
	]
	//set x and y scales to normalize data into chart space
	var xScale = d3.scaleLinear()
		.domain([xRange[0], xRange[1]]) //range of possible input data values
		.range([padding, w-padding]) //range of possible output data values

	var yScale = d3.scaleLinear()
		.domain([yRange[0], yRange[1]])
		.range([h - padding, padding]) // reverse variables to invert y

	var svg = d3.select('#chart-space')

		.append('svg')
		.attr("width", w)
		.attr('height', h) //assigning to variable allows us to capture a reference to the svg we've created to hold our data

	var circles = svg.selectAll('circle') //create empty references. Set reference variable for later use
		.data(stats) //bind data
		.enter() //return placeholder reference to new element
		.append('circle') //appends a circle to the DOM, at the end of the SVG element


	//Create Circles. Each circle will become an element on the DOM within the SVG 'canvas'
	circles.attr('cx', (stats) => {
		return (xScale(stats.x))
	})
	.attr('cy', (stats) =>{
		return (yScale(stats.y))
	} )
	.attr('r', 10+'px')
	.attr('class', 'dataDot')
	.attr('id', (stats) => {
		return stats.label
	})
	.attr('x', (stats) =>{
		return stats.x
	})
	.attr('y', (stats) =>{
		return stats.y
	})

$('svg').on('click', '.dataDot', function(event){
	var rawVals = [$(this).attr('x'), $(this).attr('y')]
	var team = event.target.id
	$('.selected').removeClass('selected')
	$(this).addClass('selected')
	$('#rowName').text(team)
	$('#valX').text(rawVals[0])
	$('#valY').text(rawVals[1])
})

	$('#stat-space').append(`<div id='correlation'>Correlation Coefficient: ${Math.round(correlation(stats)*100)/100}</div>`)
})



})




	





	

