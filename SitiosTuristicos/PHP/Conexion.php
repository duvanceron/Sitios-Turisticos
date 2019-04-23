<?php
ini_set('display_errors', 1); 
error_reporting(E_ALL ^ E_NOTICE);
//informacion para conectarse a la base de datos
$host = 'localhost';
$port = '5432';
$dbname = 'touristicsites';
$user = 'postgres';
$password = '10130204';

$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
if (!$conn) {
	echo "Not connected : " . pg_error();
	exit;
}

$table = $_GET['table'];
$fields = $_GET['fields'];
$table = "lugarturistico";
$fields = ["nombre", "municipio","imagen"];

$fieldsTable = "";
foreach ($fields as $i => $field){
    $fieldsTable = $fieldsTable. "f.$field, ";
  
}

$fieldsTable= $fieldsTable. "ST_AsGeoJSON (f.geom)";
/*echo $fieldsTable;*/
$querySql = "SELECT $fieldsTable FROM $table f";

/*echo $querySql;*/

if(isset($_POST['FrmSubmit'])&& !empty($_POST['nombre']) && !empty($_POST['latitud']) && !empty($_POST['longitud'])){
    
	// Submitted form data
	
    $name   = '<strong>' .$_POST['nombre'].'</strong>' ;
    $municipio  = $_POST['municipio'];
	$latitud= $_POST['latitud'];
	$longitud= $_POST['longitud'];
	$geometria="ST_GeomFromText('point($longitud $latitud)',4326)";
	$path='<center><img src="img/'.$_POST['path'].'" border="0" height="100px" width="200px" /></center> ';

	$InsertSql= "INSERT INTO lugarturistico (nombre,longitud,latitud,municipio,geom,imagen)VALUES('$name',$longitud,$latitud,'$municipio',$geometria,'$path')";

	if (!$status = pg_query($conn, $InsertSql)) {
		echo "Error en la consulta.\n";
		$status = 'err';
		exit;
	}else{
		$status = 'ok';
	}
	
	echo $status;die;
}



if (!$answer = pg_query($conn, $querySql)) {
	echo "Error en la consulta.\n";
	exit;
}

while ($row = pg_fetch_row($answer)) {
	foreach ($row as $i => $attr){
		echo $attr.", ";
	}
	echo ";";
}
?>

