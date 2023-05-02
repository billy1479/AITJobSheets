const rootURL = 'http://192.168.5.7:8090/';

let socket = io()
socket.on('disconnect', () => {
	openPopUp('Disconnection from server', 'Please wait for reconnection')
})
socket.on('connect', () => {
	closePopUp()
})


function changePage(pageName) {
    var pages = document.getElementsByClassName('mainContainer');
    for (i=0;i<pages.length;i++) {
        pages[i].style.display = 'None';
    }
	if (pageName == 'editClients') {
		openModal('addClientModal')
	} else if (pageName == 'editEngineers') {
		openModal('addEngineerModal')
	}
    document.getElementById(pageName).style.display = 'Block'
}

function changeSearchTab(x) {
	let tabs = document.getElementsByClassName('searchFrame')
	for (i=0;i<tabs.length;i++) {
		tabs[i].style.display = 'None';
	}
	document.getElementById(x).style.display = 'flex';
}

// Functions for add job sheets

async function loadNewID() {
    const newIDObject = await fetch(rootURL + 'loadNewID')
    const newID = await newIDObject.text()
    document.getElementById('newjobIDLabel').innerHTML = newID;
}

async function loadIDs() {
	// This works perfectly
	const IDObject = await fetch(rootURL + 'loadIDs')
	const IDs = await IDObject.json()
	var outputString = '<option value="">Please select a job ... </option>';
	for (i=0;i<IDs.length;i++){
		outputString += `<option value="${IDs[i]['ID']}">${IDs[i]['ID']}</option>`;
	}
	document.getElementById('jobSelect').innerHTML = outputString
}

async function loadEngineerNames() {
	// This is working :)
	const engineerObject = await fetch(rootURL + 'loadEngineerNames')
	const engineers = await engineerObject.json();
	var outputString = '<option value="">Please select an engineer ... </option>';
	for (i=0;i<engineers.length; i++) {
		outputString += `<option value="${engineers[i]}">${engineers[i]}</option>`;
	}
	dropdowns = document.getElementsByClassName('engineerSelect');
	for (i=0; i<dropdowns.length;i++) {
		dropdowns[i].innerHTML = outputString
	}
	document.getElementById('engineerSearchSelect').innerHTML = outputString
	document.getElementById('engineerTimeSelect').innerHTML =  outputString
}

async function loadClientNames() {
	const clientObject = await fetch(rootURL + 'loadClientNames');
	const clients = await clientObject.json();
	var outputString = '<option value="">Clients ... </option>';
	for (i=0;i<clients.length;i++) {
		outputString += `<option value="${clients[i]['Name']}">${clients[i]['Name']}</option>`;
	}
	tabs = document.getElementsByClassName('clientDropdowns');
	for (i=0;i<tabs.length;i++) {
		tabs[i].innerHTML = outputString
	}
	document.getElementById('clientSearchSelect').innerHTML = outputString;
}

function assignAddressChange() {
	clientDropdowns = document.querySelectorAll('.clientDropdowns')
	clientDropdowns.forEach((dropdown) => {
		dropdown.addEventListener('click', function () {
			dropdown.addEventListener('change', async function () {
				var clientName = dropdown.value;
				var x = {'client': clientName}
				var y = JSON.stringify(x)
				const addressObject = await fetch(rootURL + 'loadAddress', {
					method: 'post',
					headers: {
						"Content-Type": "application/json"
					},
					body: y
				})
				const addressResponse = await addressObject.json()
				var address = addressResponse[0]['Location']
				var labels = document.getElementsByClassName('locationLabels')
				for (x = 0;x<labels.length;x++) {
					labels[x].innerHTML = address
				}
			})
		})
	})
}

function assignSearchDropdown() {
	document.getElementById('jobSelect').addEventListener('click', function () {
		document.getElementById('jobSelect').addEventListener('change', async function () {
			let ID = document.getElementById('jobSelect').value
			let x = {'ID':ID}
			let y = JSON.stringify(x)
			const searchObject = await fetch(rootURL + 'searchID', {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				body: y
			})
			const searchResponse = await searchObject.json()
			loadSearchData2(searchResponse)
		})
	})
}

function assignSearchInput() {
	document.getElementById('searchFormMain').addEventListener('submit', async function (e) {
		e.preventDefault();
		changePage('mainPage')
		let ID = document.getElementById('formSearchBox').value;
		let x = {'ID' : ID}
		let y = JSON.stringify(x)
		const searchObject = await fetch(rootURL + 'searchID', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: y
		})
		const searchResponse = await searchObject.json()
		loadSearchData2(searchResponse)
		document.getElementById('formSearchBox').value = '';
		document.getElementById('jobSelect').value = ID
	})
}

function jobSheetForm() {
    document.getElementById('addJobSheetForm').addEventListener('submit', async function (e) {
        e.preventDefault()
        var date, client, ponumber, days, hours, engineers, details, expenses, equipment, jobcomplete, invoicenumber;
		var engineerBoxes, expensesBoxes, equipmentBoxes, serialNumberBoxes, costBoxes, saleBoxes, expensesBoxes;
        var jobID, location;

        jobID = document.getElementById('newjobIDLabel').innerHTML;
		location = document.getElementById('locationLabelNew').innerHTML;
		date2 = new Date(`${$('#jobDateNew').val()}`)
		day = date2.getDate()
		month = date2.getMonth() + 1
		year = date2.getFullYear()
		date = day + '-' + month + '-' + year
		client = $('#clientSelectNew').val();
		ponumber = $('#ticketReferenceInputNew').val();
		days = $('#daysEntryNew').val();
		hours = $('#hoursEntryNew').val();

		totalExpenses = document.getElementById('totalLabel2').innerHTML
		totalCost = document.getElementById('totalCostLabel2').value
		totalSale = document.getElementById('totalSaleLabel2').value

        engineers = [];
		document.querySelectorAll('.newEngineerSelect').forEach(function (x) {
			engineers.push(x.value);
		})

        details = $('#detailsAreaNew').val();

        expenses = []
		i = 0;
		document.querySelectorAll('.newTextField').forEach(function (currentInput) {
			currentValue = currentInput.value;
			temp = '';
			if (i == 0) {
				x = currentValue * 0.3;
				x = Number.parseFloat(x).toFixed(2);
				currentValue = x;
			} else {
				currentValue = Number.parseFloat(currentValue).toFixed(2);
			}
			expenses.push(currentValue); 
			i += 1;
		})

        equipmentBoxes = [];
		serialNumberBoxes = [];
		costBoxes = [];
		saleBoxes = [];
		equipment = [];
		document.querySelectorAll('.equipmentInput2').forEach(function (a) {
			equipmentBoxes.push(a.value);
		})
		document.querySelectorAll('.serialNumberInput2').forEach(function (a) {
			serialNumberBoxes.push(a.value);
		})
		document.querySelectorAll('.costNumberInput2').forEach(function (a) {
			costBoxes.push(a.value);
		})
		document.querySelectorAll('.saleNumberInput2').forEach(function (a) {
			saleBoxes.push(a.value);
		})
		i = 0;
		for (i=0;i<equipmentBoxes.length;i++) {
			if (!(equipmentBoxes[i] == '')) {
				if (saleBoxes[i] == '') {
					saleBoxes[i] == 'NPQ'
				}
			}
			tempArray = [equipmentBoxes[i], serialNumberBoxes[i], costBoxes[i], saleBoxes[i]];
			equipment.push(tempArray);
		}

		serialState = false;
		for (i=0;i<equipment.length;i++) {
			if (equipment[i][0] !== '') {
				if (equipment[i][1] == '') {
					serialState = true
				}
			}
		}

        if (serialState == true) {
			alert('Please make sure all equipment has its associated serial number - if you do not know it then please write N/A')
		} else {
			jobcomplete = $('#jobCompleteCheckbox').value;

			invoicenumber = $('#invoiceNumberInputNew').val();1

			jobForm = document.getElementById('addJobSheetForm')
			let x = new FormData(jobForm)
			x.append('Date', date)
			x.append('jobID', jobID)
			x.append('location', location)
			x.append('totalExpenses', totalExpenses)

            fetch(rootURL + 'newJobSheet', {
				method: 'post',
				body: x
			}).then((response) => {
				openPopUp('Job Sheet Added', 'The job sheet ' + jobID + ' has been added.')
				changePage('mainPage')
				loadIDs()
			}).catch((error) => {
				openPopUp('Error', error)
			})
		}
    })
}

function assignSubmitChanges() {
	document.getElementById('viewJobSheetForm').addEventListener('submit', function (e) {
		e.preventDefault();
		let date = document.getElementById('jobDate').value
		let ID = document.getElementById('jobIDLabel').innerHTML
		let client = document.getElementById('clientSelect').value
		let TRN = document.getElementById('ticketReferenceInput').value
		let days = document.getElementById('daysEntry').value
		let hours = document.getElementById('hoursEntry').value

		let engineerArray = []
		let engineerBoxes = document.getElementsByClassName('engineerSelectView')
		for (i=0;i<engineerBoxes.length;i++) {
			engineerArray.push(engineerBoxes[i].value)
		}

		let details = document.getElementById('detailsArea').value

		let expensesArray = []
		let mileage = document.getElementById('mileageEntry').value
		let food = document.getElementById('foodEntry').value
		let postage = document.getElementById('postageEntry').value
		let parking = document.getElementById('parkingEntry').value
		let tools = document.getElementById('toolsEntry').value
		expensesArray.push(mileage)
		expensesArray.push(food)
		expensesArray.push(postage)
		expensesArray.push(parking)
		expensesArray.push(tools)

		let equipmentBoxes = []
		let serialNumberBoxes = []
		let costBoxes = []
		let saleBoxes = []
		let equipment = []

		document.querySelectorAll('.equipmentInputView').forEach(function (a) {
			equipmentBoxes.push(a.value);
		})
		document.querySelectorAll('.serialNumberInputView').forEach(function (a) {
			serialNumberBoxes.push(a.value);
		})
		document.querySelectorAll('.costNumberInputView').forEach(function (a) {
			costBoxes.push(a.value);
		})
		document.querySelectorAll('.saleNumberInputView').forEach(function (a) {
			saleBoxes.push(a.value);
		})

		for (i=0;i<equipmentBoxes.length;i++) {
			if (!(equipmentBoxes[i] == '')) {
				if (saleBoxes[i] == '') {
					saleBoxes[i] == 'NPQ'
				}
				if (equipmentBoxes[i] == undefined) {
					equipmentBoxes[i] = ''
				}
				if (saleBoxes[i] == undefined) {
					saleBoxes[i] = ''
				}
			}
			// tempArray = [equipmentBoxes[i], serialNumberBoxes[i], costBoxes[i], saleBoxes[i]];
			// equipment.push(tempArray);
		}
		equipment.push(equipmentBoxes);
		equipment.push(serialNumberBoxes)
		equipment.push(costBoxes)
		equipment.push(saleBoxes)

		let invoiceNumber = document.getElementById('invoiceNumberInput').value

		let objectBody = {
			'ID': ID,
			'Date': date,
			'client': client,
			'trn': TRN,
			'days': days,
			'hours': hours,
			'engineers': engineerArray,
			'details': details,
			'expenses': expensesArray,
			'equipment': equipment,
			'invoiceNumber': invoiceNumber
		}

		let y = JSON.stringify(objectBody)


		fetch(rootURL + 'submitChange', {
			method: 'post',
			headers: {
				'Content-Type': 'application/JSON'
			},
			body: y
		}).then((response) => {
			openPopUp('Job Sheet edit', 'Job Sheet ' + ID + ' has been changed')
			changePage('mainPage')
		}).catch((error) => {
			openPopUp('Error while changing job sheet', error)
		})
	})
}

// Functions for searching areas

function assignClientSearchDropdown() {
	document.getElementById('clientSearchForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let clientName = document.getElementById('clientSearchSelect').value;
		let x = {'clientName': clientName}
		let y = JSON.stringify(x)
		const clientIDObject = await fetch(rootURL + 'loadIDClient',  {
			method: 'post', 
			headers: {
				"Content-Type": "application/json"
			},
			body: y
		})
		let outputString = '<option value="">Please select an ID</option>';
		const clientIDResponse = await clientIDObject.json()
		for (i=0;i<clientIDResponse.length;i++) {
			outputString += `<option value="${clientIDResponse[i]['ID']}">${clientIDResponse[i]['ID']}</option>`;
		}
		document.getElementById('generalSearchDropdown2').innerHTML = outputString;
	})
}

function assignEngineerSearchDropdown() {
	document.getElementById('pengineerSearchForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let engineerName = document.getElementById('engineerSearchSelect').value;
		let x = {'engineerName': engineerName}
		let y = JSON.stringify(x)
		const engineerIDObject = await fetch(rootURL + 'loadIDEngineer',  {
			method: 'post', 
			headers: {
				"Content-Type": "application/json"
			},
			body: y
		})
		let outputString = '<option value="">Please select an ID</option>';
		const engineerIDResponse = await engineerIDObject.json()
		for (i=0;i<engineerIDResponse.length;i++) {
			outputString += `<option value="${engineerIDResponse[i]}">${engineerIDResponse[i]}</option>`;
		}
		document.getElementById('generalSearchDropdown3').innerHTML = outputString;
	})
}

function assignDateSearchDropdown() {
	document.getElementById('generalSearchForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let date1 = document.getElementById('date1').value;
		let date2 = document.getElementById('date2').value;
		let x = {'date1':date1, 'date2':date2}
		let y = JSON.stringify(x)
		const dateIDObject = await fetch(rootURL + 'loadIDDate', {
			method: 'post',
			headers: {
				"Content-Type": "application/json"
			},
			body: y
		})
		let outputString = '<option value="">Please select an ID</option>';
		const dateIDResponse = await dateIDObject.json();
		for (i=0;i<dateIDResponse.length;i++) {
			outputString += `<option value="${dateIDResponse[i]['ID']}">${dateIDResponse[i]['ID']}</option>`;
		}
		document.getElementById('generalSearchDropdown').innerHTML = outputString
	})
}

function assignEngineerTimeDropdown() {
	document.getElementById('engineerSiteTimeForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let date1 = document.getElementById('etDate1').value
		let date2 = document.getElementById('etDate2').value
		let engineer = document.getElementById('engineerTimeSelect').value
		let x = {'engineer':engineer, 'date1': date1, 'date2': date2}
		let y = JSON.stringify(x)
		const engineerTimeObject = await fetch(rootURL + 'loadIDEngineerTime', {
			method: 'post',
			headers: {
				"Content-Type": 'application/json'
			},
			body: y
		})
		const engineerTimeResponse = await engineerTimeObject.json()
		openPopUp('Site-time for ' + engineer + ' between ' + date1 + ' and ' + date2, 'Days: ' + engineerTimeResponse[1] + ' and Hours: ' + engineerTimeResponse[0])
	})
}

function assignSearch() {
	// Search dates
	document.getElementById('generalSearchDropdown').addEventListener('click', function () {
		document.getElementById('generalSearchDropdown').addEventListener('change', async function () {
			let ID = document.getElementById('generalSearchDropdown').value;
			let x = {'ID': ID}
			let y = JSON.stringify(x)
			const searchObject = await fetch(rootURL + 'searchID', {
				method: 'post', 
				headers: {
					"Content-Type": "application/json"
				},
				body: y
			})
			const searchResponse = await searchObject.json();
			loadSearchData(searchResponse)
		})
	})

	// Search clients
	document.getElementById('generalSearchDropdown2').addEventListener('click', function () {
		document.getElementById('generalSearchDropdown2').addEventListener('change', async function () {
			let ID = document.getElementById('generalSearchDropdown2').value;
			let x = {'ID': ID}
			let y = JSON.stringify(x)
			const searchObject = await fetch(rootURL + 'searchID', {
				method: 'post', 
				headers: {
					"Content-Type": "application/json"
				},
				body: y
			})
			const searchResponse = await searchObject.json();
			loadSearchData(searchResponse)
		})
	})

	// Search P engineer
	document.getElementById('generalSearchDropdown3').addEventListener('click', function () {
		document.getElementById('generalSearchDropdown3').addEventListener('change', async function () {
			let ID = document.getElementById('generalSearchDropdown3').value;
			let x = {'ID': ID}
			let y = JSON.stringify(x)
			const searchObject = await fetch(rootURL + 'searchID', {
				method: 'post', 
				headers: {
					"Content-Type": "application/json"
				},
				body: y
			})
			const searchResponse = await searchObject.json();
			loadSearchData(searchResponse)
		})
	})
}

async function loadSearchData(data) {
	var date, client, ponumber, days, hours, engineers, details, expenses, equipment, invoicenumber;
	// This stores the Engineer index array
	engineers = JSON.parse((data[0]['Engineers']));

	// this is for the expenses list
	var mileage, food, postage, parking, tools;
	mileage = JSON.parse(data[0]['Expenses'])[0];
	newMileage = mileage / 0.3;
	food = JSON.parse(data[0]['Expenses'])[1];
	postage = JSON.parse(data[0]['Expenses'])[2];
	parking = JSON.parse(data[0]['Expenses'])[3];
	tools = JSON.parse(data[0]['Expenses'])[4];

	// this is for the equipment list
	var equipmentArray = [];
	equipment = JSON.parse(data[0]['Equipment']);
	equipment.forEach(function (x) {
		equipmentArray.push(x)
	})

	// this is for setting the values of the form

	document.getElementById('jobDateSearch').value = data[0]['Date'];
	document.getElementById('clientSelectSearch').value = data[0]['Client'];
	// location is loaded based off client select load
	document.getElementById('TRNSearch').value = data[0]['ponumber'];
	document.getElementById('daysEntrySearch').value = data[0]['Days'];
	document.getElementById('hoursEntrySearch').value = data[0]['Hours'];
	document.getElementById('jobIDLabelSearch').innerHTML = data[0]['ID']


	// engineers goes here - new dropdown will need to be made and add an extra line of code that follows the below pattern
	document.getElementById('engineerSelect1Search').value = engineers[0];
	document.getElementById('engineerSelect2Search').value = engineers[1];
	document.getElementById('engineerSelect3Search').value = engineers[2];
	document.getElementById('engineerSelect4Search').value = engineers[3];

	document.getElementById('detailsAreaSearch').value = data[0]['JobDetails']

	// expenses goes here
	document.getElementById('mileageEntrySearch').value = newMileage;
	document.getElementById('milageLabelSearch').innerHTML = '£' + mileage
	document.getElementById('foodEntrySearch').value = food;
	document.getElementById('postageEntrySearch').value = postage;
	document.getElementById('parkingEntrySearch').value = parking;
	document.getElementById('toolsEntrySearch').value = tools;

	document.getElementById('postageLabelSearch').innerHTML = '£' + postage;
	document.getElementById('foodLabelSearch').innerHTML = '£' + food;
	document.getElementById('parkingLabelSearch').innerHTML = '£' + parking;
	document.getElementById('toolsLabelSearch').innerHTML = '£' + tools;

	loadTotal3();

	let equipmentEntryBoxes = document.getElementsByClassName('equipmentSearch')
	if (equipmentArray.length > equipmentEntryBoxes.length) {
		entryBoxLength = equipmentEntryBoxes.length
		for (i=0;i<equipmentArray.length - (entryBoxLength);i++) {
			addEquipmentAreaSearch()
		}
	} else if (equipmentArray.length < equipmentEntryBoxes.length) {
		entryBoxLength = equipmentEntryBoxes.length
		// for (i=0;i<(entryBoxLength) - (equipmentArray.length);i++) {
		// 	let equipmentFrame = document.getElementsByClassName('extraEquipmentBoxSearch')
		// 	equipmentFrame[equipmentFrame.length-1].remove();
		// }
		console.log('This is an error for the equipment boxes.')
	}

	// equipment go here
	counter = 0;
	document.querySelectorAll('.equipmentSearch').forEach(function (x) {
		x.value = equipmentArray[counter][0];
		counter = counter + 1;
	})
	counter = 0;
	document.querySelectorAll('.serialNumberSearch').forEach(function (x) {
		x.value = equipmentArray[counter][1];
		counter = counter + 1;
	})
	counter = 0;
	document.querySelectorAll('.costNumberSearch').forEach(function (x) {
		x.value = equipmentArray[counter][2];
		counter = counter + 1;
	})
	counter = 0;
	document.querySelectorAll('.saleNumberSearch').forEach(function (x) {
		x.value = equipmentArray[counter][3];
		counter = counter + 1;
	})

	total = 0;
	areas = document.getElementsByClassName('costNumberSearch');
	for (x=0;x<areas.length;x++) {
		temp = parseFloat(areas[x].value);
		total = parseFloat(total + temp);
	}
	total = Number.parseFloat(total).toFixed(2)
	document.getElementById('totalCostLabelSearch').value = '£' + total;
	total = 0;
	areas = document.getElementsByClassName('saleNumberSearch');
	for (x=0;x<areas.length;x++) {
		temp = parseFloat(areas[x].value);
		total = parseFloat(total + temp);
	}
	total = Number.parseFloat(total).toFixed(2);
	document.getElementById('totalSaleLabelSearch').value = '£' + total;

	document.getElementById('invoiceNumberInputSearch').value = data[0]['InvoiceNumber'];

	var x = {'client': data[0]['Client']}
	var y = JSON.stringify(x)
	const addressObject = await fetch(rootURL + 'loadAddress', {
		method: 'post',
		headers: {
			"Content-Type": "application/json"
		}, 
		body: y
	})
	const addressResponse = await addressObject.json()

	document.getElementById('locationLabelSearch').innerHTML = addressResponse[0]['Location'];
}

async function loadSearchData2 (data) {
	var date, client, ponumber, days, hours, engineers, details, expenses, equipment, invoicenumber;
	// This stores the Engineer index array
	engineers = JSON.parse((data[0]['Engineers']));

	// this is for the expenses list
	var mileage, food, postage, parking, tools;
	mileage = JSON.parse(data[0]['Expenses'])[0];
	newMileage = mileage / 0.3;
	food = JSON.parse(data[0]['Expenses'])[1];
	postage = JSON.parse(data[0]['Expenses'])[2];
	parking = JSON.parse(data[0]['Expenses'])[3];
	tools = JSON.parse(data[0]['Expenses'])[4];

	// this is for the equipment list
	var equipmentArray = [];
	equipment = JSON.parse(data[0]['Equipment']);
	equipment.forEach(function (x) {
		equipmentArray.push(x)
	})

	// this is for setting the values of the form

	document.getElementById('jobDate').value = (data[0]['Date']).split('T')[0];
	document.getElementById('clientSelect').value = data[0]['Client'];
	// location is loaded based off client select load
	document.getElementById('ticketReferenceInput').value = data[0]['ponumber'];
	document.getElementById('daysEntry').value = data[0]['Days'];
	document.getElementById('hoursEntry').value = data[0]['Hours'];
	document.getElementById('jobIDLabel').innerHTML = data[0]['ID']


	// engineers goes here - new dropdown will need to be made and add an extra line of code that follows the below pattern
	document.getElementById('engineerSelect1').value = engineers[0];
	document.getElementById('engineerSelect2').value = engineers[1];
	document.getElementById('engineerSelect3').value = engineers[2];
	document.getElementById('engineerSelect4').value = engineers[3];

	document.getElementById('detailsArea').value = data[0]['JobDetails']

	// expenses goes here
	document.getElementById('mileageEntry').value = mileage;
	document.getElementById('milageLabel').innerHTML = '£' + ((mileage * 0.3).toFixed(2))
	document.getElementById('foodEntry').value = food;
	document.getElementById('postageEntry').value = postage;
	document.getElementById('parkingEntry').value = parking;
	document.getElementById('toolsEntry').value = tools;

	document.getElementById('postageLabel').innerHTML = '£' + postage;
	document.getElementById('foodLabel').innerHTML = '£' + food;
	document.getElementById('parkingLabel').innerHTML = '£' + parking;
	document.getElementById('toolsLabel').innerHTML = '£' + tools;

	loadTotal();

	let equipmentEntryBoxes = document.getElementsByClassName('equipmentInput')
	if (equipmentArray.length > equipmentEntryBoxes.length) {
		entryBoxLength = equipmentEntryBoxes.length
		for (i=0;i<equipmentArray.length - (entryBoxLength);i++) {
			addEquipmentArea()
		}
	} else if (equipmentArray.length < equipmentEntryBoxes.length) {
		entryBoxLength = equipmentEntryBoxes.length
		for (i=0;i<(entryBoxLength) - (equipmentArray.length);i++) {
			let equipmentFrame = document.getElementsByClassName('extraEquipmentBox')
			if (!(equipmentFrame.length == 0)) {
				equipmentFrame[equipmentFrame.length-1].remove();
			} 
		}
	}

	// equipment go here
	counter = 0;
	document.querySelectorAll('.equipmentInput').forEach(function (x) {
		x.value = equipmentArray[0][counter];
		counter = counter + 1;
	})
	counter = 0;
	document.querySelectorAll('.serialNumberInput').forEach(function (x) {
		x.value = equipmentArray[1][counter];
		counter = counter + 1;
	})
	counter = 0;
	document.querySelectorAll('.costNumberInput').forEach(function (x) {
		x.value = equipmentArray[2][counter];
		counter = counter + 1;
	})
	counter = 0;
	document.querySelectorAll('.saleNumberInput').forEach(function (x) {
		if (equipmentArray[3][counter] == 'NPQ') {
			x.value = 0
		} else {
			x.value = equipmentArray[3][counter];
		}
		counter = counter + 1;
	})

	total = 0;
	areas = document.getElementsByClassName('costNumberInputView');
	for (x=0;x<areas.length;x++) {
		temp = parseFloat(areas[x].value);
		total = parseFloat(total + temp);
	}
	total = Number.parseFloat(total).toFixed(2)
	document.getElementById('totalCostLabel').value = '£' + total;
	total = 0;
	areas = document.getElementsByClassName('saleNumberInputView');
	for (x=0;x<areas.length;x++) {
		temp = parseFloat(areas[x].value);
		total = parseFloat(total + temp);
	}
	total = Number.parseFloat(total).toFixed(2);
	document.getElementById('totalSaleLabel').value = '£' + total;

	document.getElementById('invoiceNumberInput').value = data[0]['InvoiceNumber'];

	var x = {'client': data[0]['Client']}
	var y = JSON.stringify(x)
	const addressObject = await fetch(rootURL + 'loadAddress', {
		method: 'post',
		headers: {
			"Content-Type": "application/json"
		}, 
		body: y
	})
	const addressResponse = await addressObject.json()
	document.getElementById('locationLabel').innerHTML = addressResponse[0]['Location'];
}

// ------------------- ADMIN FUNCTIONS --------------------

async function loadClientTable() {
	let container = document.getElementById('ClientContainer')
	const clientObject = await fetch(rootURL + 'loadClientTable')
	const clientResponse = await clientObject.json()
	let outputString = "<table class='tableClass'><tr><th>ID</th><th>Client Name</th><th>Client Address</th></tr>"
	for (i=0;i<clientResponse.length;i++) {
		outputString += `<tr><td class="rowtd">${clientResponse[i]['ID']}</td><td class="rowtd">${clientResponse[i]['Name']}</td><td class="rowtd">${clientResponse[i]['Location']}</td></tr>`
	}
	outputString += "</table"
	container.innerHTML = outputString
}

async function loadEngineerTable() {
	let container = document.getElementById('engineerTableContainer')
	const engineerObject = await fetch(rootURL + 'loadEngineerTable')
	const engineerResponse = await engineerObject.json()
	let outputString = "<table class='tableClass'><tr><th>ID</th><th>Name</th></tr>"
	for (i=0;i<engineerResponse.length;i++) {
		outputString += `<tr><td class="rowtd">${engineerResponse[i]['ID']}</td><td class="rowtd">${engineerResponse[i]['Name']}</td></tr>`
	}
	outputString += "</table"
	container.innerHTML = outputString
}

function addClient() {
	document.getElementById('addClientForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let newName = document.getElementById('addClientText').value;
		let newAddress = document.getElementById('clientAddressText').value;
		let x = {'name': newName, 'address': newAddress}
		let y = JSON.stringify(x)
		fetch(rootURL + 'addClient', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			}, 
			body: y
		}).then((response) => {
			openPopUp('New Client Added!', newName + ' has been added as a client.')
		}).catch((error) => {
			openPopUp('Error', error)
		})
		document.getElementById('addClientText').value = '';
		document.getElementById('clientAddressText').value = '';
		loadClientTable();
		loadClientNames();
	})
}

function editClientName() {
	document.getElementById('editClientNameForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let oldName = document.getElementById('clientEditSelect').value;
		let newName = document.getElementById('clientNameText').value;
		let x = {'old': oldName, 'new': newName}
		let y = JSON.stringify(x)
		fetch(rootURL + 'editClientName', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: y
		}).then((response) => {
			openPopUp('Name Changed!', oldName + ' has been changed to ' + newName)
		}).catch((error) => {
			openPopUp('Error', error)
		})
		loadClientTable();
		loadClientNames();
	})
}

function editClientAddress() {
	document.getElementById('editClientAddressForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let clientName = document.getElementById('clientEditSelect2').value;
		let newAddress = document.getElementById('editclientAddressText').value;
		let x = {'clientName': clientName, 'newAddress': newAddress}
		let y = JSON.stringify(x)
		fetch(rootURL + 'editClientAddress', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: y
		}).then((response) => {
			openPopUp('Address Changed!', clientName + ' has its address changed to ' + newAddress)
		}).catch((error) => {
			openPopUp('Error', error)
		})
		loadClientTable();
		loadClientNames();
	})
}

function deleteClient() {
	document.getElementById('deleteClientForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let clientName = document.getElementById('deleteClientSelect').value;
		let x = {'clientName': clientName}
		let y = JSON.stringify(x)
		fetch(rootURL + 'deleteClient', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: y
		}).then((response) => {
			openPopUp('Client deleted!', clientName + ' has been deleted')
		}).catch((error) => {
			openPopUp('Error', error)
		})
		loadClientTable();
		loadClientNames();
	})
}

function addEngineer() {
	document.getElementById('addEngineerForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let engineerName = document.getElementById('addengineerText').value;
		let x = {'engineerName': engineerName}
		let y = JSON.stringify(x)
		fetch(rootURL + 'addEngineer', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: y
		}).then((response) => {
			openPopUp('Engineer added!', engineerName + ' has been added')
		}).catch((error) => {
			openPopUp('Error', error)
		})
		loadEngineerTable();
		loadEngineerNames();
	})
}

function editEngineer() {
	document.getElementById('editEngineerNameForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let oldName = document.getElementById('engineerSelect').value;
		let newName = document.getElementById('engineerEditText').value;
		let x = {'oldName': oldName, 'newName': newName}
		let y = JSON.stringify(x)
		fetch(rootURL + 'editEngineer', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: y
		}).then((response) => {
			openPopUp('Engineer name changed!', oldName + ' has had their name changed to ' + newName)
		}).catch((error) => {
			openPopUp('Error', error)
		})
		loadEngineerTable();
		loadEngineerNames();
	})
}

function deleteEngineer() {
	document.getElementById('deleteEngineerForm').addEventListener('submit', async function (e) {
		e.preventDefault();
		let engineerName = document.getElementById('engineerSelectDelete').value;
		let x = {'engineerName': engineerName}
		let y = JSON.stringify(x)
		fetch(rootURL + 'deleteEngineer', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: y
		}).then((response) => {
			openPopUp('Engineer deleted!', engineerName + ' been deleted')
		}).catch((error) => {
			openPopUp('Error', error)
		})
		loadEngineerTable();
		loadEngineerNames();
	})
}


// -------------------- NORMAL FUNCTIONS ------------------

function openPopUp(x,y) {
	document.getElementById('popUpTitle').innerText = x
	document.getElementById('popUpContent').innerText = y
	document.getElementById('popUpMessage').style.display = 'Block';
}

function closePopUp() {
	document.getElementById('popUpMessage').style.display = 'None';
}


function loadTotal() {
	// This is for the main page
    var total;
	mileage = parseFloat($('#mileageEntry').val());
	food = parseFloat($('#foodEntry').val());
	postage = parseFloat($('#postageEntry').val());
	parking = parseFloat($('#parkingEntry').val());
	tools = parseFloat($('#toolsEntry').val());
	var i;
	total = food + (mileage*0.3) + postage + parking + tools;
	total = Number.parseFloat(total).toFixed(2)
	document.getElementById('totalLabel').innerHTML = '£' + total;
}

function loadTotal3() {
// This is for the search page	var total;
	mileage = parseFloat($('#mileageEntrySearch').val());
	food = parseFloat($('#foodEntrySearch').val());
	postage = parseFloat($('#postageEntrySearch').val());
	parking = parseFloat($('#parkingEntrySearch').val());
	tools = parseFloat($('#toolsEntrySearch').val());
	var i;
	total = food + (mileage*0.3) + postage + parking + tools;
	total = Number.parseFloat(total).toFixed(2)
	document.getElementById('totalLabelSearch').innerHTML = '£' + total;
}

function loadTotal2() {
	// For the add job sheet page
	var total;
	mileage = parseFloat($('#mileageEntry2').val());
	food = parseFloat($('#foodEntry2').val());
	postage = parseFloat($('#postageEntry2').val());
	parking = parseFloat($('#parkingEntry2').val());
	tools = parseFloat($('#toolsEntry2').val());
	var i;
	total = food + (mileage*0.3) + postage + parking + tools;
	console.log(total)
	total = Number.parseFloat(total).toFixed(2)
	document.getElementById('totalLabel2').innerHTML = '£' + total;
}


function equipmentAssign() {
	// This is for the main page
	var i, inputs, inputs2;
	var temp, x, areas, total;
	inputs = document.getElementsByClassName('costNumberInputView');
	inputs2 = document.getElementsByClassName('saleNumberInputView');
	for (i=0;i<inputs.length;i++) {
		inputs[i].addEventListener('blur', function () {
			total = 0;
			areas = document.getElementsByClassName('costNumberInputView');
			for (x=0;x<areas.length;x++) {
				temp = parseFloat(areas[x].value);
				total = parseFloat(total + temp);
			}
			total = Number.parseFloat(total).toFixed(2)
			document.getElementById('totalCostLabel').value = '£' + total;
		})
	}
	i = 0;
	for (i=0;i<inputs.length;i++) {
		inputs2[i].addEventListener('blur', function () {
			total = 0;
			areas = document.getElementsByClassName('saleNumberInputView');
			for (x=0;x<areas.length;x++) {
				temp = parseFloat(areas[x].value);
				total = parseFloat(total + temp);
			}
			total = Number.parseFloat(total).toFixed(2);
			document.getElementById('totalSaleLabel').value = '£' + total;
		})
	}
}

function equipmentAssign2() {
	// This is for the add job sheet form page
	var i, inputs, inputs2;
	var temp, x, areas, total;
	inputs = document.getElementsByClassName('costNumberInput2');
	inputs2 = document.getElementsByClassName('saleNumberInput2');
	for (i=0;i<inputs.length;i++) {
		inputs[i].addEventListener('blur', function () {
			total = 0;
			areas = document.getElementsByClassName('costNumberInput2');
			for (x=0;x<areas.length;x++) {
				temp = parseFloat(areas[x].value);
				total = parseFloat(total + temp);
			}
			total = Number.parseFloat(total).toFixed(2)
			document.getElementById('totalCostLabel2').value = '£' + total;
		})
	}
	i = 0;
	for (i=0;i<inputs.length;i++) {
		inputs2[i].addEventListener('blur', function () {
			total = 0;
			areas = document.getElementsByClassName('saleNumberInput2');
			for (x=0;x<areas.length;x++) {
				temp = parseFloat(areas[x].value);
				total = parseFloat(total + temp);
			}
			total = Number.parseFloat(total).toFixed(2);
			document.getElementById('totalSaleLabel2').value = '£' + total;
		})
	}
}


function openModal(name) {
    var tabs, i;
    tabs = document.getElementsByClassName('mymodal');
    for (i=0;i<tabs.length;i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById(name).style.display = 'block';
}

function formElements() {
	// This is for the main page
    document.getElementById('foodEntry').addEventListener('blur', function () {
		y = $('#foodEntry').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('foodLabel').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal();
	})
    document.getElementById('postageEntry').addEventListener('blur', function () {
		y = $('#postageEntry').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('postageLabel').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal();
	})
    document.getElementById('parkingEntry').addEventListener('blur', function () {
		y = $('#parkingEntry').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('parkingLabel').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal();
	})
    document.getElementById('toolsEntry').addEventListener('blur', function () {
		y = $('#toolsEntry').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('toolsLabel').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal();
	})
    document.getElementById('mileageEntry').addEventListener('blur', function () {
		x = 0.3;
		mileage = $('#mileageEntry').val();
		y = x * mileage
		y = Number.parseFloat(y).toFixed(2)
		z = '£' + y
		document.getElementById('milageLabel').innerHTML = z;
		// this updates the total charge at the bottom of the form
		loadTotal();
	})

	// This is for the add job sheet area
	document.getElementById('foodEntry2').addEventListener('blur', function () {
		y = $('#foodEntry2').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('foodLabel2').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('postageEntry2').addEventListener('blur', function () {
		y = $('#postageEntry2').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('postageLabel2').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('parkingEntry2').addEventListener('blur', function () {
		y = $('#parkingEntry2').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('parkingLabel2').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('toolsEntry').addEventListener('blur', function () {
		y = $('#toolsEntry2').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('toolsLabel2').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('mileageEntry2').addEventListener('blur', function () {
		x = 0.3;
		mileage = $('#mileageEntry2').val();
		y = x * mileage
		y = Number.parseFloat(y).toFixed(2)
		z = '£' + y
		document.getElementById('milageLabel2').innerHTML = z;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})

	// This is for the search area
	document.getElementById('foodEntrySearch').addEventListener('blur', function () {
		y = $('#foodEntrySearch').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('foodLabelSearch').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('postageEntrySearch').addEventListener('blur', function () {
		y = $('#postageEntrySearch').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('postageLabelSearch').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('parkingEntrySearch').addEventListener('blur', function () {
		y = $('#parkingEntrySearch').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('parkingLabelSearch').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('toolsEntrySearch').addEventListener('blur', function () {
		y = $('#toolsEntrySearch').val();
		y = Number.parseFloat(y).toFixed(2)
		document.getElementById('toolsLabelSearch').innerHTML = '£' + y;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})
    document.getElementById('mileageEntrySearch').addEventListener('blur', function () {
		x = 0.3;
		mileage = $('#mileageEntrySearch').val();
		y = x * mileage
		y = Number.parseFloat(y).toFixed(2)
		z = '£' + y
		document.getElementById('milageLabelSearch').innerHTML = z;
		// this updates the total charge at the bottom of the form
		loadTotal2();
	})

}

function addEquipmentArea() {
	// This is for adding equipment rows to the add job sheet area 
	document.getElementById('addExpenseButton').addEventListener('click', function () {
		let y = document.getElementById('extraEquipmentFrameAdd')
		document.getElementById('extraEquipmentFrameAdd').insertAdjacentHTML('afterend', '<li class="extraEquipmentBox"><input type="text" name="expenses" class="equipmentInput2"><input type="text" name="serialNumber" class="serialNumberInput2" placeholder="N/A"><input type="number" name="costNumber" class="costNumberInput2" value="0"><input type="number" name="saleNumber" class="saleNumberInput2" value="0"></li>')
		equipmentAssign()
	})
}

function addEquipmentAreaSearch() {
	document.getElementById('extraEquipmentFrameSearchC').insertAdjacentHTML('afterend', '<li class="extraEquipmentBoxSearch"><input type="text" name="expenses" class="equipmentInput2"><input type="text" name="serialNumber" class="serialNumberInput2" placeholder="N/A"><input type="number" name="costNumber" class="costNumberInput2" value="0"><input type="number" name="saleNumber" class="saleNumberInput2" value="0"></li>')
	equipmentAssign2()
}

function sendPDF2() {
	var myWindow = window.open('', 'PRINT');
	var id, date, client, ponumber, days, hours, engineers, details, expenses, equipment, jobcomplete, invoicenumber;
	var engineerBoxes, expensesBoxes, equipmentBoxes, serialNumberBoxes, costBoxes, saleBoxes, expensesBoxes;
	id = document.getElementById('jobIDLabel').innerHTML;
	date = $('#jobDate').val();
	client = $('#clientSelect').val();
	ponumber = $('#ponumberInput').val();
	days = $('#daysEntry').val();
	hours = $('#hoursEntry').val();
	details = $('#detailsArea').val();
	locationz = document.getElementById('locationLabel').innerHTML;

	let numberOfLineBreaks = (details.match(/\n/g) || []).length;
	let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;

	engineers = [];
	document.querySelectorAll('.engineerSelect').forEach(function (x) {
		engineers.push(x.value);
	})

	let totalExpenses = 0
	expenses = []
	i = 0;
	document.querySelectorAll('.textField').forEach(function (currentInput) {
		currentValue = currentInput.value;
		temp = '';
		if (i == 0) {
			x = currentValue * 0.3;
			x = Number.parseFloat(x).toFixed(2);
			currentValue = x;
		} else {
			currentValue = Number.parseFloat(currentValue).toFixed(2);
		}
		expenses.push(currentValue);
		totalExpenses = totalExpenses + parseFloat(currentValue); 
		i += 1;
	})

	totalExpenses = Number.parseFloat(totalExpenses).toFixed(2);

	equipmentBoxes = [];
	serialNumberBoxes = [];
	costBoxes = [];
	saleBoxes = [];
	equipment = [];
	totalSale = 0;
	totalCost = 0;
	document.querySelectorAll('.equipmentInputView').forEach(function (a) {
		equipmentBoxes.push(a.value);
	})
	document.querySelectorAll('.serialNumberInputView').forEach(function (a) {
		serialNumberBoxes.push(a.value);
	})
	document.querySelectorAll('.costNumberInputView').forEach(function (a) {
		costBoxes.push(a.value);
		totalCost = totalCost + Number.parseFloat(a.value);
	})
	document.querySelectorAll('.saleNumberInputView').forEach(function (a) {
		saleBoxes.push(a.value);
		totalSale = totalSale + Number.parseFloat(a.value);
	})
	i = 0;
	for (i=0;i<equipmentBoxes.length;i++) {
		tempArray = [equipmentBoxes[i], serialNumberBoxes[i], costBoxes[i], saleBoxes[i]];
		equipment.push(tempArray);
	}
	totalCost = Number.parseFloat(totalCost).toFixed(2);
	totalSale = Number.parseFloat(totalSale).toFixed(2);

	jobcomplete = $('#jobCompleteCheckbox').value;

	// invoice number
	invoicenumber = $('#invoiceNumberInput').val();

	// these are for sorting the variables for the layout of the PDF
	// engineers - this counts how many of the dropdowns were filled so an exact number of spaces can be allocated 
	let tempEngineers = []
	let engineerCounter = 0;
	engineers.forEach(function(x) {
		if (x == '') {

		} else {
			tempEngineers.push(x)
			engineerCounter += 1;
		} 
	})

	// equipment - this counts how many of the equipment list was filled (goes off the basis that the names must be filled in for anything else to be filled in)
	tempEquipment = []
	equipmentCounter = 0;
	equipment.forEach(function(x) {
		if (x[0] == '') {

		} else {
			tempEquipment.push(x)
			equipmentCounter += 1;
		}
	})

	// converts data to english format
	tempYear = date[0] + date[1] + date[2] + date[3];
	tempMonth = date[5] + date[6];
	tempDay = date[8] + date [9];
	newDate = tempDay + '/' + tempMonth + '/' + tempYear	

	// the total expenses, total cost and total sale are calculated above with the normal functions

	myWindow.document.write('<html><title>Job Sheet Print</title><body>')
	myWindow.document.write("<h2 style='display: inline-block;'>Job Sheets</h2>")
	myWindow.document.write("<h2 style='display: inline-block; float: right;'>Job Number - " + id + "</h2>")
	myWindow.document.write('<h3 style="display: block; font-size: 2rem;">' + newDate + '</h3>');
	myWindow.document.write('<h3 style="font-size: 2rem; display: block;">' + client + '</h3>')
	myWindow.document.write('<ul>')
	myWindow.document.write('<li>Location - ' + locationz + '</li>')
	myWindow.document.write('<li>Engineers:' + '</li>')

	for (i=0;i<engineerCounter;i++) {
		myWindow.document.write('<li><strong>' + engineers[i] + '</strong></li>')
	}
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')

	myWindow.document.write('<li>Days - ' + days + '</li>')
	myWindow.document.write('<li>Hours - ' + hours + '</li>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul style="list-style: none">')
	myWindow.document.write('<li>Details:' + '</li>')
	myWindow.document.write('<li><textarea style="height: ' + newHeight + 'px; border: none; width: 800px">' + details + '</textarea></li>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')
	myWindow.document.write('<li>Equipment:</li>')

	for (i=0;i<equipmentCounter;i++) {
		myWindow.document.write('<li>Name: ' + equipment[i][0] + ' | Serial Number: ' + equipment[i][1] + ' | Cost Number: ' + equipment[i][2] + ' | Sale Number: ' + equipment[i][3] + '</li>')
	}

	myWindow.document.write('<li>Total Cost: ' + totalCost + '</li>')
	myWindow.document.write('<li>Total Sale: ' + totalSale + '</li>')

	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')
	myWindow.document.write('<li>Expenses:' + '</li>')
	myWindow.document.write('<li>Mileage: ' + expenses[0] + ' ('+ mileage + ' miles)</li>')
	myWindow.document.write('<li>Food: ' + expenses[1] + '</li>')
	myWindow.document.write('<li>Postage: ' + expenses[2] + '</li>')
	myWindow.document.write('<li>Parking: ' + expenses[3] + '</li>')
	myWindow.document.write('<li>Tools: ' + expenses[4] + '</li>')
	myWindow.document.write('<li>Total Expenses: ' + totalExpenses + '</li>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<button id="printButton" onclick="window.print()">PRINT</button>')
	myWindow.document.write('<button onclick="mailto:expenses@Ardenit.net">Email</button>')
	myWindow.document.write('<button onclick="window.close()">CLOSE</button>')
	myWindow.document.write('</body></html>')
	myWindow.document.close();
}

function sendPDF3() {
	var myWindow = window.open('', 'PRINT');
	var id, date, client, ponumber, days, hours, engineers, details, expenses, equipment, jobcomplete, invoicenumber;
	var engineerBoxes, expensesBoxes, equipmentBoxes, serialNumberBoxes, costBoxes, saleBoxes, expensesBoxes;
	id = document.getElementById('jobIDLabelSearch').innerHTML;
	date = $('#jobDateSearch').val();
	client = $('#clientSelectSearch').val();
	ponumber = $('#TRNSearch').val();
	days = $('#daysEntrySearch').val();
	hours = $('#hoursEntrySearch').val();
	details = $('#detailsAreaSearch').val();
	locationz = document.getElementById('locationLabelSearch').innerHTML;

	let numberOfLineBreaks = (details.match(/\n/g) || []).length;
	let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;

	engineers = [];
	document.querySelectorAll('.engineerSearch').forEach(function (x) {
		engineers.push(x.value);
	})

	let totalExpenses = 0
	expenses = []
	i = 0;
	document.querySelectorAll('.textFieldSearch').forEach(function (currentInput) {
		currentValue = currentInput.value;
		temp = '';
		if (i == 0) {
			x = currentValue * 0.3;
			x = Number.parseFloat(x).toFixed(2);
			currentValue = x;
		} else {
			currentValue = Number.parseFloat(currentValue).toFixed(2);
		}
		expenses.push(currentValue);
		totalExpenses = totalExpenses + parseFloat(currentValue); 
		i += 1;
	})

	totalExpenses = Number.parseFloat(totalExpenses).toFixed(2);

	equipmentBoxes = [];
	serialNumberBoxes = [];
	costBoxes = [];
	saleBoxes = [];
	equipment = [];
	totalSale = 0;
	totalCost = 0;
	document.querySelectorAll('.equipmentSearch').forEach(function (a) {
		equipmentBoxes.push(a.value);
	})
	document.querySelectorAll('.serialNumberSearch').forEach(function (a) {
		serialNumberBoxes.push(a.value);
	})
	document.querySelectorAll('.costNumberSearch').forEach(function (a) {
		costBoxes.push(a.value);
		totalCost = totalCost + Number.parseFloat(a.value);
	})
	document.querySelectorAll('.saleNumberSearch').forEach(function (a) {
		saleBoxes.push(a.value);
		totalSale = totalSale + Number.parseFloat(a.value);
	})
	i = 0;
	for (i=0;i<equipmentBoxes.length;i++) {
		tempArray = [equipmentBoxes[i], serialNumberBoxes[i], costBoxes[i], saleBoxes[i]];
		equipment.push(tempArray);
	}
	totalCost = Number.parseFloat(totalCost).toFixed(2);
	totalSale = Number.parseFloat(totalSale).toFixed(2);

	jobcomplete = $('#jobCompleteCheckbox').value;

	// invoice number
	invoicenumber = $('#invoiceNumberInputSearch').val();

	// these are for sorting the variables for the layout of the PDF
	// engineers - this counts how many of the dropdowns were filled so an exact number of spaces can be allocated 
	let tempEngineers = []
	let engineerCounter = 0;
	engineers.forEach(function(x) {
		if (x == '') {

		} else {
			tempEngineers.push(x)
			engineerCounter += 1;
		} 
	})

	// equipment - this counts how many of the equipment list was filled (goes off the basis that the names must be filled in for anything else to be filled in)
	tempEquipment = []
	equipmentCounter = 0;
	equipment.forEach(function(x) {
		if (x[0] == '') {

		} else {
			tempEquipment.push(x)
			equipmentCounter += 1;
		}
	})

	// converts data to english format
	tempYear = date[0] + date[1] + date[2] + date[3];
	tempMonth = date[5] + date[6];
	tempDay = date[8] + date [9];
	newDate = tempDay + '/' + tempMonth + '/' + tempYear	

	// the total expenses, total cost and total sale are calculated above with the normal functions

	myWindow.document.write('<html><title>Job Sheet Print</title><body>')
	myWindow.document.write("<h2 style='display: inline-block;'>Job Sheets</h2>")
	myWindow.document.write("<h2 style='display: inline-block; float: right;'>Job Number - " + id + "</h2>")
	myWindow.document.write('<h3 style="display: block; font-size: 2rem;">' + newDate + '</h3>');
	myWindow.document.write('<h3 style="font-size: 2rem; display: block;">' + client + '</h3>')
	myWindow.document.write('<ul>')
	myWindow.document.write('<li>Location - ' + locationz + '</li>')
	myWindow.document.write('<li>Engineers:' + '</li>')

	for (i=0;i<engineerCounter;i++) {
		myWindow.document.write('<li><strong>' + engineers[i] + '</strong></li>')
	}
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')

	myWindow.document.write('<li>Days - ' + days + '</li>')
	myWindow.document.write('<li>Hours - ' + hours + '</li>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul style="list-style: none">')
	myWindow.document.write('<li>Details:' + '</li>')
	myWindow.document.write('<li><textarea style="height: ' + newHeight + 'px; border: none; width: 800px">' + details + '</textarea></li>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')
	myWindow.document.write('<li>Equipment:</li>')

	for (i=0;i<equipmentCounter;i++) {
		myWindow.document.write('<li>Name: ' + equipment[i][0] + ' | Serial Number: ' + equipment[i][1] + ' | Cost Number: ' + equipment[i][2] + ' | Sale Number: ' + equipment[i][3] + '</li>')
	}

	myWindow.document.write('<li>Total Cost: ' + totalCost + '</li>')
	myWindow.document.write('<li>Total Sale: ' + totalSale + '</li>')

	myWindow.document.write('</ul>')
	myWindow.document.write('<br>')
	myWindow.document.write('<ul>')
	myWindow.document.write('<li>Expenses:' + '</li>')
	myWindow.document.write('<li>Mileage: ' + expenses[0] + ' ('+ mileage + ' miles)</li>')
	myWindow.document.write('<li>Food: ' + expenses[1] + '</li>')
	myWindow.document.write('<li>Postage: ' + expenses[2] + '</li>')
	myWindow.document.write('<li>Parking: ' + expenses[3] + '</li>')
	myWindow.document.write('<li>Tools: ' + expenses[4] + '</li>')
	myWindow.document.write('<li>Total Expenses: ' + totalExpenses + '</li>')
	myWindow.document.write('</ul>')
	myWindow.document.write('<button id="printButton" onclick="window.print()">PRINT</button>')
	myWindow.document.write('<button onclick="mailto:expenses@Ardenit.net">Email</button>')
	myWindow.document.write('<button onclick="window.close()">CLOSE</button>')
	myWindow.document.write('</body></html>')
	myWindow.document.close();
}


// Function for when the page loads

function callerFunction() {
    changePage('mainPage')
    loadNewID()
	loadIDs()
	loadEngineerNames()
	loadClientNames()
	assignAddressChange()
	formElements()
	addEquipmentArea();
	equipmentAssign();
	equipmentAssign2();
	assignClientSearchDropdown();
	assignEngineerSearchDropdown();
	assignDateSearchDropdown();
	assignSearch();
	assignSearchDropdown();
	assignSearchInput();
	loadClientTable();
	loadEngineerTable();
	addClient();
	editClientAddress();
	editClientName();
	deleteClient();
	addEngineer()
	editEngineer();
	deleteEngineer();
	jobSheetForm();
	assignEngineerTimeDropdown();
	assignSubmitChanges();
}

document.addEventListener('DOMContentLoaded', callerFunction)