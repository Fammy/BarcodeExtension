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

$(function ()
{
	// Load previous values
	var data =  localStorage["barcodeExtension_Data"];
	var barcode = localStorage["barcodeExtension_Barcode"];
	var size = localStorage["barcodeExtension_Size"];

	if (data)
	{
		$('#data').val(data);
	}

	if (barcode)
	{
		$('#barcode').val(barcode);
	}

	if (size)
	{
		$('#size').val(size);
	}

	// Save values on change
	$('#data').blur(function ()
	{
		localStorage["barcodeExtension_Data"] = $(this).val();
	});

	$('#barcode').change(function ()
	{
		localStorage["barcodeExtension_Barcode"] = $(this).val();
	});

	$('#size').change(function ()
	{
		localStorage["barcodeExtension_Size"] = $(this).val();
	});

	// Focus initial field
	$('#data').select();

	$('#submit').on('click', function(event) {
		event.preventDefault();

		var displayName = $('#barcode option:selected').text();
		var barcode = $('#barcode').val();
		var data = $('#data').val();
		var size = $('#size').val();

		$('.error').empty();
		$('#result').empty();
		$('#download').hide();
		$('form').attr('action', '');

		var rule = rules[barcode];

		if (rule.charset !== 'ascii') {
			if (!validData(data, rule.charset)) {
				$('.error').text('Invalid characters. Only ' + rule.charsetName + ' allowed');
				return;
			}
		}

		if (rule.minLength && data.length < rule.minLength) {
			$('.error').text(displayName + ' must be at least ' + rule.minLength + ' characters.');
			return;
		}

		if (rule.maxLength && data.length > rule.maxLength) {
			$('.error').text(displayName + ' must be at most ' + rule.maxLength + ' characters.');
			return;
		}

		var url = 'https://barcodegen.azurewebsites.net/api/Generate?code=G/6JsCh2VyPUiqraxTOqsrzElgjUnFEwNaBJyxc1iaL9DD8m0a0ZGg==&type=' + barcode + '&content=' + encodeURIComponent(data).replace("''", '%27') + '&size=' + size;
		$('#download-button').data('url', url);
		$('form').attr('action', url + '&download=1');

		var img = $('<img src="' + url + '"/>').error( function () {
			$('.error').text('Failed to load barcode. Are you sure the data you entered is correct?');
			$('#result').empty();
		})

		$('#result').append(img);
		$('#download').show();
	});
	if (data) {
		$('#submit').click();
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
