var rules = {
	aztec: { charset: 'ascii', charsetName: 'valid ASCII' },
	code39: { charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.*$/+% ', charsetName: 'A-Z, 0-9, and - . * $ / + %' },
	code128: { charset: 'ascii', charsetName: 'valid ASCII' },
	datamatrix: { charset: 'ascii', charsetName: 'valid ASCII' },
	ean8: { minLength: 7, maxLength: 8, charset: '0123456789', charsetName: 'numbers' },
	ean13: { minLength: 12, maxLength: 13, charset: '0123456789', charsetName: 'numbers' },
	itf: { minLength: 14, maxLength: 14, charset: '0123456789', charsetName: 'numbers' },
	msi: { charset: '0123456789', charsetName: 'numbers' },
	pdf417: { charset: 'ascii', charsetName: 'valid ASCII' },
	qrcode: { charset: 'ascii', charsetName: 'valid ASCII' },
	upca: { minLength: 11, maxLength: 12, charset: '0123456789', charsetName: 'numbers' }
}

document.addEventListener('DOMContentLoaded', function () {
	// Load previous values
	var data = localStorage["barcodeExtension_Data"];
	var barcode = localStorage["barcodeExtension_Barcode"];
	var size = localStorage["barcodeExtension_Size"];
	var include = localStorage["barcodeExtension_Include"];

	if (data) {
		document.getElementById('data').value = data;
	}

	if (barcode) {
		document.getElementById('barcode').value = barcode;
	}

	if (size) {
		document.getElementById('size').value = size;
	}

	console.log(include);
	if (include === "true") {
		document.getElementById('include').checked = true;
	}

	// Save values on change
	document.getElementById('data').addEventListener('blur', function () {
		localStorage["barcodeExtension_Data"] = this.value;
	});

	document.getElementById('barcode').addEventListener('change', function () {
		localStorage["barcodeExtension_Barcode"] = this.value;
	});

	document.getElementById('size').addEventListener('change', function () {
		localStorage["barcodeExtension_Size"] = this.value;
	});

	document.getElementById('include').addEventListener('change', function () {
		localStorage["barcodeExtension_Include"] = this.checked;
	});

	// Focus initial field
	document.getElementById('data').select();

	document.getElementById('submit').addEventListener('click', function (event) {
		event.preventDefault();

		var barcodeEl = document.getElementById('barcode');
		var displayName = barcodeEl.options[barcodeEl.selectedIndex].text;
		var barcode = barcodeEl.value;
		var data = document.getElementById('data').value;
		var size = document.getElementById('size').value;
		var include = document.getElementById('include').checked;

		var errorEl = document.querySelector('.error');
		var resultEl = document.getElementById('result');
		var downloadEl = document.getElementById('download');
		var formEl = document.querySelector('form');

		errorEl.textContent = '';
		resultEl.innerHTML = '';
		downloadEl.style.display = 'none';
		formEl.setAttribute('action', '');

		if (data.trim().length === 0) {
			errorEl.textContent = 'Data can\'t be empty.';
			return;
		}

		var rule = rules[barcode];

		if (rule.charset !== 'ascii') {
			if (!validData(data, rule.charset)) {
				errorEl.textContent = 'Invalid characters. Only ' + rule.charsetName + ' allowed';
				return;
			}
		}

		if (rule.minLength && data.length < rule.minLength) {
			errorEl.textContent = displayName + ' must be at least ' + rule.minLength + ' characters.';
			return;
		}

		if (rule.maxLength && data.length > rule.maxLength) {
			errorEl.textContent = displayName + ' must be at most ' + rule.maxLength + ' characters.';
			return;
		}

		if (['ean8', 'ean13', 'upca', 'itf'].indexOf(barcode) !== -1 && data.length === rule.maxLength) {
			if (!isValidChecksum(data)) {
				errorEl.textContent = 'Invalid checksum digit. Please check your data.';
				return;
			}
		}

		var includeQs = include ? "1" : "0";

		var url = 'https://barcodegen.famularo.org/Generate?type=' + barcode
			+ '&content=' + encodeURIComponent(data).replace(/'/g, '%27')
			+ '&size=' + size
			+ '&include=' + includeQs;
		document.getElementById('download-button').dataset.url = url;
		formEl.setAttribute('action', url + '&download=1');

		fetch(url)
			.then(function (response) {
				if (response.status === 429) {
					errorEl.textContent = 'You created too many barcodes. Please try again in a minute.';
					return;
				}
				if (!response.ok) {
					errorEl.textContent = 'Failed to load barcode. Are you sure the data you entered is correct?';
					return;
				}
				return response.blob().then(function (blob) {
					var objectUrl = URL.createObjectURL(blob);
					var img = document.createElement('img');
					img.src = objectUrl;
					resultEl.appendChild(img);
					downloadEl.style.display = '';
				});
			})
			.catch(function (error) {
				errorEl.textContent = 'Failed to load barcode. Are you sure the data you entered is correct?';
				resultEl.innerHTML = '';
			});
	});

	if (data) {
		document.getElementById('submit').click();
	}
});

function validData(data, charset) {
	for (var i = 0; i < data.length; ++i) {
		if (charset.indexOf(data[i]) === -1) {
			return false;
		}
	}

	return true;
}

function isValidChecksum(data) {
	var sum = 0;
	for (var i = 0; i < data.length - 1; i++) {
		var digit = parseInt(data[data.length - 2 - i], 10);
		sum += (i % 2 === 0) ? digit * 3 : digit;
	}
	var checkDigit = (10 - (sum % 10)) % 10;
	return checkDigit === parseInt(data[data.length - 1], 10);
}
