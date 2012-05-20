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
});