const express = require('express')
const app = express()
const fs = require('fs')
const multer = require('multer')
const cors = require('cors')
var bodyParser = require('body-parser')
var formidable = require('formidable')
const nodemailer = require('nodemailer')
const path = require('path')
const axios = require('axios')
var FormData = require('form-data')
const Mustache = require('mustache')
const pdf = require('pdf-node')
const htmlpdf = require('html-pdf')
const htmlpdf2 = require('html-pdf-node')

const upload = multer()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'client')))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

// storage

directory = path.dirname("")
var parent = path.resolve(directory, '..')
// var uploaddir = parent + (path.sep) + 'ArdenNode' + (path.sep) + 'Receipts' + (path.sep);
var uploaddir = parent + (path.sep) + 'NodeJobs' + (path.sep)
console.log(uploaddir)

// SQL Server

let mysql = require('mysql')
const file = require('fileupload/lib/modules/file')

let db_config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jobs',
    timezone: 'utc'
}

// function handle_disconnect() {
//     let connection = mysql.createConnection(db_config); 
//     connection.connect(function(err) {
//         if (err) {setTimeout(handle_disconnect, 2000)};
//         console.log('SQL database is connected')
//     })

//     connection.on('error', function(err) {
//         console.log('db error', err);
//         if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//           handle_disconnect();                         // lost due to either server restart, or a
//         } else {                                      // connnection idle timeout (the wait_timeout
//           throw err;                                  // server variable configures this)
//         }
//     });
// }

// handle_disconnect();
let connection = mysql.createConnection(db_config); 
connection.connect(function(err) {
    if (err) {console.log(err)};
    console.log('SQL database is connected')
})

setInterval(function () {
    connection.query('SELECT 1');
}, 5000);




// API for AIT Job Sheets

// General

app.post('/newJobSheet', upload.any(), function (req, resp) {
    let jobID = req.body.jobID
    let date = req.body.Date
    let clientName = req.body.client
    let location = req.body.location
    let ticketReference = req.body.ponumber
    let days = req.body.days
    let hours = req.body.hours
    let engineer1 = req.body.engineer1
    let engineer2 = req.body.engineer2
    let engineer3 = req.body.engineer3
    let engineer4 = req.body.engineer4
    let files = req.files

    fileArray = []

    const currentDate = new Date()
    let month = currentDate.getUTCMonth()
    let year = currentDate.getUTCFullYear()
    let day = currentDate.getUTCDate()
    let tempDate = '-' + year + '-' + month + '-' + day

    for (i=0;i<files.length;i++) {
        fs.writeFile(uploaddir + 'Receipts' + (path.sep) + files[i].originalname + tempDate + '.pdf', files[i].buffer, function (err) {
            if (err) throw err;
        })
        y = files[i].originalname + tempDate + '.pdf'
        q = uploaddir + 'Receipts'
        let filepath = path.join(q, y);
        fileArray.push({filename: files[i].originalname, path: filepath, contentType: 'application/pdf'})
    }

    let engineers = Array()
    engineers.push(engineer1)
    engineers.push(engineer2)
    engineers.push(engineer3)
    engineers.push(engineer4)

    let details = req.body.jobDetails
    let numberOfLineBreaks = (details.match(/\n/g) || []).length;
	let newHeight = 110 + numberOfLineBreaks * 20 + 12 + 2;

    let mileage = req.body.mileage
    let food = req.body.food
    let postage = req.body.postage
    let parking = req.body.parking
    let tools = req.body.tools

    let expenses = Array()
    expenses.push(mileage)
    expenses.push(food)
    expenses.push(postage)
    expenses.push(parking)
    expenses.push(tools)

    let equipment1 = req.body.expenses
    let serialNumber = req.body.serialNumber
    let costNumber = req.body.costNumber
    let saleNumber = req.body.saleNumber

    let equipment = Array()

    for (i=0;i<equipment1.length;i++) {
        if (!(equipment1[i] == '')) {
            if (saleNumber[i] == 0) {
                saleNumber[i] = 'NPQ';
            }
        }
    }


    equipment.push(equipment1)
    equipment.push(serialNumber)
    equipment.push(costNumber)
    equipment.push(saleNumber)

    expenses = JSON.stringify(expenses)
    equipment = JSON.stringify(equipment)
    engineers = JSON.stringify(engineers)

    let invoiceNumber = req.body.invoiceNumber

    connection.query('INSERT INTO jobs (Date, Client, ponumber, Days, Hours, Engineers, JobDetails, Expenses, Equipment, InvoiceNumber) VALUES (?,?,?,?,?,?,?,?,?,?)', [date, clientName, ticketReference, days, hours, engineers, details, expenses, equipment, invoiceNumber], function (err, result, field) {
        if (err) throw err;
    })

    equipment = JSON.parse(equipment)
    engineers = JSON.parse(engineers)

    var jobsheet = {
            jobNumber: jobID,
            jobDate: date,
            clientName: clientName,
            location: location,
            engineers: engineers,
            days: days,
            hours: hours,
            detailsHeight: newHeight,
            details: details,
            equipment: equipment,
            totalCost: req.body.totalCost,
            totalSale: req.body.totalSale,
            mileage: mileage2 = (mileage * 0.3).toFixed(2),
            mileageReal: mileage,
            food: food,
            postage: postage,
            parking: parking,
            tools:tools,
            totalExpenses: req.body.totalExpenses
    }


    htmlForEmail = `<html><title>Job Sheet Print</title><body><h2 style='display: inline-block;'>Job Sheets</h2>
    <h2 style='display: inline-block; float: right;'>Job Number - ${jobID}</h2>
    <h3 style="display: block; font-size: 2rem;">${date}</h3>
    <h3 style="font-size: 2rem; display: block;">${clientName}</h3>
    <ul>
    <li>Location - ${location}</li>
    <li>Engineers:</li>`

    for (i=0;i<engineers.length;i++) {
        if (engineers[i] == '') {
            break
        }
        htmlForEmail += `<li><strong>${engineers[i]}</strong></li>`
    }

    htmlForEmail += `
    </ul>
    <br>
    <ul>
    <li>Days - ${days}</li>
    <li>Hours - ${hours}</li>
    </ul>
    <br>
    <ul style="list-style: none">
    <li>Details:</li>
    <li><textarea style="height: ${newHeight}px; border: none; width: 600px">${details}</textarea></li>
    </ul>
    <ul>
    </ul>
    <br>
    <ul>
    </ul>
    <br>
    <ul>
    <li>Equipment:</li>`

    for (i=0;i<equipment[0].length;i++) {
        if (equipment[0][i] == '') {
            break
        }
        htmlForEmail += `<li>Name: ${equipment[0][i]} | Serial Number: ${equipment[1][i]} | Cost Number: ${equipment[2][i]} | Sale Number: ${equipment[3][i]} </li>`
    }

    mileage2 = (mileage * 0.3).toFixed(2)

    htmlForEmail += `<li>Total Cost: ${req.body.totalCost}</li>
    <li>Total Sale: ${req.body.totalSale}</li>
    <ul>
    <br>
    <ul>
    <li>Expenses:</li>
    <li>Mileage: £${mileage2} (${mileage} miles)</li>
    <li>Food: £${food}</li>
    <li>Postage: £${postage}</li>
    <li>Parking: £${parking}</li>
    <li>Tools: £${tools}</li>
    <li>Total Expenses: ${req.body.totalExpenses}</li>
    </ul>    
    `

    let options = { 
        format: 'A4', 
    }

    htmlpdf.create(htmlForEmail, options).toFile('JobSheet1.pdf', function(err, res) {
        if (err) {
            resp.send(err)
        } else {
            jobSheetFilePath = uploaddir + 'JobSheet1.pdf',
            fileArray.push({filename: 'JobSheet: ' + jobID + '.pdf', path: jobSheetFilePath, contentType: 'application/pdf'})

            const emailFunction = () => {
                var transporter = nodemailer.createTransport({
                    host: 'smtp.office365.com', 
                    port: 587,
                    auth: {
                        user: 'jobsheets@ardenit.net',
                        pass: 'Yam28835'
                    },
                    tls: {rejectUnauthorized: false,},
                })
        
                var mailOptions = {
                    from: 'jobsheets@ardenit.net',
                    to: 'expenses@ardenit.net',
                    subject: 'Job Sheet: ' + jobID,
                    body: 'Please find attached the job sheet and receipt(s) for Job Number ' + jobID,
                    attachments: fileArray
                }
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        resp.send(error)
                    } else {
                        resp.sendStatus(200)
                        fs.unlink(jobSheetFilePath, (err) => {
                            if (err) throw err;
                        })
                    }
                })
            }
            emailFunction();
        }
    })


    


})

app.post('/loadAddress', function (req, resp) {
    var clientName = req.body.client
    connection.query('SELECT Location from clients where Name = ?', [clientName], function (err, result, fields) {
        if (err) throw err;
        resp.send(JSON.stringify(result))
    })
})

app.get('/loadEngineerNames', function (req, resp) {
    connection.query('SELECT ID, Name from engineers ORDER BY Name ASC', function (err, result, fields) {
        if (err) throw err;
        var x = result;
        var myArray = Array();
        for (i=0;i<result.length;i++) {
            myArray.push(result[i]['Name'])
        }
        resp.send(myArray);
    })
})

app.get('/loadClientNames', function (req, resp) {
    connection.query('SELECT Name from clients ORDER BY Name ASC', function (err, result, fields) {
        if (err) throw err;
        resp.send(result)
    })
})

app.post('/searchID', function (req, resp) {
    // query is done via localhost/searchID46 (there is no : used)
    var ID = req.body.ID
    connection.query('SELECT * from jobs where ID = ?', [ID], function (err, result, fields) {
        resp.send(JSON.stringify(result))
    })
})

app.post('/submitChange', function (req, resp) {
    jobId = req.body.ID
    date = req.body.Date
    client = req.body.client
    ponumber = req.body.trn
    days = req.body.days
    hours = req.body.hours
    engineer = req.body.engineers
    equipment = req.body.equipment
    details = req.body.details
    expenses = req.body.expenses
    invoiceNumber = req.body.invoiceNumber

    // need to make query for editing equipment

    connection.query('UPDATE jobs SET Date = ?, Client = ?, ponumber = ?, Days = ?, Hours = ?, Engineers = ?, JobDetails = ?, Expenses = ?, Equipment = ?, InvoiceNumber = ? WHERE ID = ?', [date, client, ponumber, days, hours, JSON.stringify(engineer), details, JSON.stringify(expenses), JSON.stringify(equipment),invoiceNumber, jobId], function (err, result) {
        if (err) throw err;
        resp.sendStatus(200)
    })

    
})

app.get('/loadNewID', function (req, resp) {
    connection.query('SELECT ID from jobs ORDER BY ID DESC', function (err, result, fields) {
        if (err) throw err;
        var x = result[0]
        var newID = String(x['ID'] + 1)
        resp.send(newID)
    })
})

app.get('/loadIDs', function (req,resp) {
    connection.query('SELECT ID FROM jobs ORDER BY ID DESC', function (err, result, fields) {
        if (err) throw err;
        resp.send(result)
    })
})

// Search area

app.post('/loadIDDate', function (req, resp) {
    var date1 = req.body.date1
    var date2 = req.body.date2
    connection.query('SELECT ID from jobs WHERE CAST(Date as Date) BETWEEN ? AND ?', [date1, date2], function (err, result, fields) {
        if (err) throw err;
        resp.send(JSON.stringify(result))
    })
})

app.post('/loadIDClient', function (req, resp) {
    var clientName = req.body.clientName
    connection.query('SELECT ID FROM jobs WHERE client = ? ORDER BY ID DESC', [clientName], function (err, result, fields) {
        if (err) throw err;
        resp.send(JSON.stringify(result))
    })
})

app.post('/loadIDEngineer', function (req, resp) {
    var engineerName = req.body.engineerName
    connection.query('SELECT ID, Engineers FROM jobs', function (err, result, fields) {
        if (err) throw err;
        var x = result
        var Idkeys = Object.keys(x)
        var mainArray = Array()
        Idkeys.forEach(function (y) {
            mainArray.push(x[y])
        })
        outputArray = Array()
        for (i=0;i<mainArray.length;i++) {
            let engineerName2 = ''
            for (y=1;y<mainArray[i]['Engineers'].length;y++) {
                if (y == 1) {
                } else if (mainArray[i]['Engineers'][y] == '"') {
                    if (engineerName2 == engineerName) {
                        outputArray.push(mainArray[i]['ID'])
                    }
                } else {
                    engineerName2 += mainArray[i]['Engineers'][y]
                }
            }
            engineerName2 = ''
        }
        resp.send(outputArray)
    })
})

app.post('/loadIDEngineerTime', function (req,resp) {
    var engineerName = req.body.engineer
    var date1 = req.body.date1
    var date2 = req.body.date2
    var totalDays = 0
    var totalHours = 0
    var outputArray = Array()
    connection.query('SELECT ID, Engineers, Hours, Days FROM jobs where CAST(Date as Date) BETWEEN ? AND ?', [date1, date2], function (err, result, fields) {
        if (err) throw err;
        var x = result
        var engineerKeys = Object.keys(x)
        for (i=0;i<engineerKeys.length;i++) {
            let tempEngineerArray = JSON.parse(x[i]['Engineers'])
            for (y=0;y<tempEngineerArray.length;y++) {
                let currentPick = tempEngineerArray[y]
                if (currentPick == engineerName) {
                    totalDays += x[i]['Days']
                    totalHours += x[i]['Hours']
                }
            }
        }
        outputArray.push(totalHours)
        outputArray.push(totalDays)
        resp.send(outputArray)
    })
})

// System administration

app.get('/loadClientTable', function (req, resp) {
    connection.query('SELECT * FROM clients', function (err, result) {
        if (err) throw err;
        resp.send(result)
    })
})

app.get('/loadEngineerTable', function (req,resp) {
    connection.query('SELECT * from engineers', function (err, result) {
        if (err) throw err;
        resp.send(result)
    })
})

app.post('/addEngineer', function (req, resp) {
    var engineerName = req.body.engineerName
    connection.query('INSERT INTO engineers (Name) VALUES (?)', [engineerName], function (err, result) {
        if (err) throw err;
        resp.send(200)
    })
})

app.post('/deleteEngineer', function (req, resp) {
    var engineer = req.body.engineerName;
    connection.query('DELETE FROM engineers WHERE Name = ?', [engineer], function (err, result) {
        if (err) throw err;
        resp.send(200)
    })
})

app.post('/editEngineer', function (req, resp) {
    var engineer = req.body.oldName;
    var newName = req.body.newName;
    connection.query('UPDATE engineers set Name = ? WHERE Name = ?', [newName, engineer], function (err, result) {
        if (err) throw err;
        resp.send(200)
    })
})

app.post('/addClient', function (req, resp) {
    var clientName = req.body.name;
    var clientAddress = req.body.address;
    connection.query('INSERT INTO clients (Name, Location) VALUES (?,?)', [clientName, clientAddress], function (err, result) {
        if (err) throw err;
        resp.send(200)
    })
})

app.post('/deleteClient', function (req, resp) {
    var clientName = req.body.clientName;
    connection.query('DELETE FROM clients WHERE Name = ?', [clientName], function (err, result) {
        if (err) throw err;
        resp.send(200)
    })
})

app.post('/editClientName', function (req, resp) {
    var clientName = req.body.old;
    var newName = req.body.new;
    connection.query('UPDATE clients set Name = ? WHERE Name = ?', [newName, clientName], function (err, result) {
        if (err) throw err;
        resp.send(200)
    })
})  

app.post('/editClientAddress', function (req, resp) {
    var clientName = req.body.clientName;
    var newAddress = req.body.clientAddress;
    connection.query('UPDATE clients set Location = ? WHERE Name = ?', [newAddress, clientName], function (err, result) {
        if (err) throw err;
        resp.send(200)
    })
})  

module.exports = app