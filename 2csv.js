const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs')

const header = []
const data = []

const csvFromArrayOfArrays = convertArrayToCSV(dataArrays, {
    header,
    separator: ','
  });

fs.writeFile('output.csv', csvFromArrayOfArrays, function(err){
    if (err) throw err;
    console.log('Successfully saved to csv')
})

