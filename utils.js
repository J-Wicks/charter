//translate image to text
const Tesseract = require('tesseract.js')
const fs = require('fs')

const imgToCSV =  function(result){

	console.log('Your translated data',result)
	let labels = false;
	let confidenceMatrix = [];
	let newCSV = '';
	let filename = Math.floor(Math.random()*100);

		//get confidence intervals for chart styling
		// result.lines.forEach( line => {
		// 	const linelength = line.text.split(' ').join('').length
		// 	let textBlocks = line.text.split(' ')
		// 	let prilength = 0
		// 	textBlocks = textBlocks.map ( (block, idx) => {
				
		// 		const symbolsToParse = line.symbols.slice(prilength, block.length)
		// 		prilength = block.length
		// 		console.log(block,  symbolsToParse)

		// 		let confidence = 0


		// 		return { text: block, confidence: 0}
		// 	})
		// confidenceMatrix.push(textBlocks)
		// })
	// console.log('Parsing new file: ', result)

		if(result.lines[0].text.split(' ').length > 2)
		{
			labels = true;
		}

		//pull headers off and push them to csv as-is
		let headers = result.lines.shift().text.split(' ')


		headers = headers.map( (column, index) => {
			if(headers.indexOf(column) != index)
				{return column + '(2)'}
			else return column;
		})

		newCSV+= headers.join(',')

		//for each line, parse through the symbol choices and swith characters to the first most likely number
		//note - if labels are on, this rule does not apply
		result.lines.forEach ( (line, idx) =>{	
			let index = 0;
			let column = 0;
			var jindex = 0;
			//remove spaces and check length. Spaces are not represented as symbols in the array
			while(jindex < line.text.length) {
				

				if(!labels || column > 0) {
					let switched = false
					line.symbols[index].choices.forEach( symbol =>{

						if(isNaN(line.text[jindex]) && !switched && !isNaN(symbol.text) && line.text[jindex] != '.'){
							//replace the master line text with the best number match
							result.lines[idx].text = result.lines[idx].text.replaceAt(jindex, symbol.text);

							switched = true
						}
					})
				} 
				//only increase count if the letter in question is not a space
				if(line.text[index] != ' '){
					index++
				} else column++
				jindex++
			}

			let lineText  = line.text.replace(/[^a-zA-Z0-9—. ]/g, '');
			lineText = lineText.replace(/^[—]/g, '');
			lineText = lineText.replace(/[—]/g, ' ');
			lineText = lineText.replace(/[ ]/g, ',');
			if(!labels){
				newCSV += 'label,'+lineText + '\n';
			} else newCSV += lineText + '\n'

		})
		fs.writeFile(__dirname + `/csv/${filename}.csv`, newCSV, (err) => {
			if(err) throw err;
		})
		return newCSV
	}

//helper function reducing objects to just x and y properties

const reduceXY = function(object, labelProp, xProp, yProp){
	let newObj = {}
	newObj.label = object[labelProp]
	newObj.x = Number(object[xProp])
	newObj.y = Number(object[yProp])
	return newObj
} 

//calculate correlation coefficient

const correlation = function(data) {
	let sumXY =0,
	sumX = 0,
	sumY = 0,
	sumXX = 0,
	sumYY = 0,
	n = data.length
	delete data.columns


	// capture sums for formula
	data.forEach(object => {
		sumXY += object.x * object.y
		sumX += object.x
		sumY += object.y
		sumXX += object.x*object.x
		sumYY += object.y*object.y


	})

	//execute correlation coefficient formula
	var r = ((n*sumXY) - (sumX*sumY))/Math.sqrt(((n*sumXX)-(sumX*sumX)) * ((n*sumYY)-(sumY*sumY)))

	return r
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

module.exports= {reduceXY, correlation, imgToCSV}
