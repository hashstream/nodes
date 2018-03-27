<?php
	$long = isset($_GET["long"]) ? $_GET["long"] : 0;
	$lat = isset($_GET["lat"]) ? $_GET["lat"] : 0;
	$range = isset($_GET["range"]) ? $_GET["range"] : 0;
	
	$redis = new Redis();
	
	$redis->pconnect('127.0.0.1');
	
	$hosts = $redis->geoRadius("hs:nodes:geo", $long, $lat, $range, "km", ["WITHCOORD"]);
	
	$parsed = array(
		"type" => "FeatureCollection",
		"features" => array()
	);
	foreach($hosts as $host){
		$ep = unpack("Pip/Pip2/Sport", $host[0]);
		$nh = inet_ntop(pack("PP", $ep["ip"], $ep["ip2"]));
		array_push($parsed["features"], array(
			"type" => "Feature",
			"geometry" => array(
				"type" => "Point",
				"coordinates" => array(floatval($host[1][0]), floatval($host[1][1])) 
			)
		));
	}
	header('Content-Type: application/json');
	echo json_encode($parsed);
?>