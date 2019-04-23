
var map,
	fields = ["nombre", "municipio", "imagen"],
	autocomplete = [],
	greenIcon,path;

$(document).ready(StartUp);

function StartUp() {
	$("#mapid").height($(window).height());

	map = L.map("mapid", {
		center: L.latLng(1.617208, -75.613294),
		zoom: 10
	});

	var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiZHV2YW5jZXJvbiIsImEiOiJjanNtajRsdWwwMjViNDltcnNtc2VrcmY5In0.DLwr4RQruiCTFL8sh6P13g'
	}).addTo(map);
	map.on('contextmenu', function sendData(e) {
		$('#modalForm').modal('show');
		$('#Latitud').val(e.latlng.lat.toString());
		$('#Longitud').val(e.latlng.lng.toString());
	});
	$('input[type=file]').change(function () {
		path = $('input[type=file]').val().replace(/.*(\/|\\)/, ''); 
	});

	getData()

};

function getData() {
	$.ajax("PHP/Conexion.php", {
		data: {
			table: "lugarturistico",
			fields: fields
		},
		success: function (data) {
			DatosMapa(data);
		}
	})

};

function DatosMapa(data) {
	//Eliminar capa de mapas existentes
	map.eachLayer(function (layer) {
		if (typeof layer._url === "undefined") {//typeof: indica el tipo de dato
			map.removeLayer(layer);
		}
	});

	//crea el geoJson que contendra los objetos
	var geojson = {
		"type": "FeatureCollection",
		"features": []
	};
	//console.log(geojson);
	//Dividir los datos en caracteristicas
	var dataArray = data.split(", ;");

	dataArray.pop();//elimina el ultimo elemento de un array

	//console.log(dataArray);

	//Construir el geoJson con las caracteristicas.
	dataArray.forEach(function (d) {
		d = d.split(", "); //Divide los valores en atributos individuales y la geometria

		//contenedor caracteristicas  de los objetos
		var feature = {
			"type": "Feature",
			"properties": {}, //Contenedor de las propiedades del objeto
			"geometry": JSON.parse(d[fields.length])
		};
		//console.log(feature);

		for (var i = 0; i < fields.length; i++) {
			feature.properties[fields[i]] = d[i];
			//console.log(d[i])
		};

		//agregar nombres de caracteristicas para autocompletar la lista
		if ($.inArray(feature.properties.featname, autocomplete) == -1) {
			autocomplete.push(feature.properties.featname);
		};

		geojson.features.push(feature);

	});



	//activate autocomplete on featname input
	/*$("input[name=name]").autocomplete({
		source: autocomplete
	});*/




// Inicio código
	var mapDataLayer = L.geoJson(geojson, {
		pointToLayer: function (feature, latlng) {
			//console.log(feature);
			var markerStyle = {
				radius: 8,
				fillColor: "#ff7800",
				color: "#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8,


			};

			return L.circleMarker(latlng, markerStyle);
		},
		onEachFeature: function (feature, layer) {
			var html = "";
			for (prop in feature.properties) {
				html += feature.properties[prop] + "<br>";
				
			};
			layer.bindPopup(html);
		}
	}).addTo(map);
};
/*
function submitQuery(){
	//get the form data
	var formdata = $("form").serializeArray();

	//add to data request object
	var data = {
		table: "fracsandsites",
		fields: fields
	};
	formdata.forEach(function(dataobj){
		data[dataobj.name] = dataobj.value;

	});

	//call the php script
	$.ajax("PHP/Conexion.php", {

		data: data,
		success: function(data){
			DatosMapa (data);

		}

	})
};*/
function RegisterSite() {
	var reg = /^[A-Z0-9._%+-]+@([A-Z0-9-]+.)+[A-Z]{2,4}$/i;
	var nombre = $('#nombre').val();
	var municipio = $('#Municipio').val();
	var latitud = $('#Latitud').val();
	var longitud = $('#Longitud').val();
	var message = $('#Message').val();
	path = $('input[type=file]').val().replace(/.*(\/|\\)/, ''); 
	if (nombre.trim() == '') {
		alert('Por favor ingrese su nombre');
		$('#nombre').focus();
		return false;
	} else if (municipio.trim() == '') {
		alert('Por favor ingrese el municipio.');
		$('#Municipio').focus();
		return false;
	} /*else if (message.trim() == '') {
		alert('Por favor ingrese una descripción.');
		$('#Message').focus();
		return false;
	}*/ else {
		$.ajax({
			type: 'POST',
			url: 'PHP/Conexion.php',
			data: 'FrmSubmit=1&nombre=' + nombre + '&municipio=' + municipio + '&latitud=' + latitud + '&longitud=' + longitud + '&message=' + message+'&path=' + path,
			beforeSend: function () {
				$('.submitBtn').attr("disabled", "disabled");
				$('.modal-body').css('opacity', '.5');
			},
			success: function (msg) {
				console.log(msg);
				if (msg == 'ok') {
					$('#nombre').val('');
					$('#Municipio').val('');
					$('#Message').val('');
					$('.statusMsg').html('<span style="color:green;">La información se ingreso correctamente.</p>');
				} else {
					$('.statusMsg').html('<span style="color:red;">Algunos problemas ocurrieron, por favor intente de nuevo.</span>');
				}
				$('.submitBtn').removeAttr("disabled");
				$('.modal-body').css('opacity', '');
			}
		});
	}
}


