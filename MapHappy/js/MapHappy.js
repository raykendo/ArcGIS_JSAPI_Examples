require([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/dom",
	"esri/map", 
	"dojo/domReady!"
	], function (array, connect, dom, Map) {
	
	var mapArray = [],
		masterIndex = 0,
		masterZoom,
		masterPan,
		mapConfig = [
			{id: "map1", options: {basemap: "streets", center: [-90, 40], zoom: 7}}, 
			{id: "map2", options: {basemap: "satellite", center: [-90, 40], zoom: 6}},
			{id: "map3", options: {basemap: "hybrid", center: [-90, 40], zoom: 6}},
			{id: "map4", options: {basemap: "topo", center: [-90, 40], zoom: 6}},
			{id: "map5", options: {basemap: "gray", center: [-90, 40], zoom: 6}},
			{id: "map6", options: {basemap: "oceans", center: [-90, 40], zoom: 6}},
			{id: "map7", options: {basemap: "national-geographic", center: [-90, 40], zoom: 6}},
			{id: "map8", options: {basemap: "osm", center: [-90, 40], zoom: 6}}
		]; 
	
	function mapSwap (mapNode, containerNode) {
		var toMaster = document.createDocumentFragment(),
			toSlave = document.createDocumentFragment(),
			masterMap = dom.byId(mapArray[masterIndex].id),
			masterContainer = dom.byId("master_container");
		// clip master and slave maps from their parent nodes
		toMaster.appendChild(mapNode);
		toSlave.appendChild(masterMap);
		
		// add new master to master container
		masterContainer.appendChild(toMaster);
		// add new slave to slave container
		containerNode.appendChild(toSlave);
	}
	
	function setMaster (map) {
		var getIndexRegex = /\d+/;
		map.enableMapNavigation();
		map.showZoomSlider();
		// get the index of the map in the array
		masterIndex = parseInt(getIndexRegex.exec(map.id)[0], 10) - 1;
		// set up events that handle the main map's zoom 
		connect.disconnect(masterZoom);
		masterZoom = connect.connect(map, "onZoomEnd", function (extent, zoomFactor, anchor, level) {
			array.forEach(mapArray, function (slaveMap) {
				if (slaveMap === map) {
					return;
				}
				slaveMap.setExtent(extent);
			});
		});
		connect.disconnect(masterPan);
		masterPan = connect.connect(map, "onPanEnd", function (extent, endPoint) {
			array.forEach(mapArray, function (slaveMap) {
				if (slaveMap === map) {
					return;
				}
				slaveMap.setExtent(extent);
			});
		});
	}
	
	function setSlave (map) {
		map.disableMapNavigation();
		map.hideZoomSlider();
		connect.connect(map, "onClick", function (e) {
			var mapNode = dom.byId(map.id),
				containerNode = mapNode.parentNode,
				oldMaster = mapArray[masterIndex],
				masterExtent = {};
				for (e in oldMaster.extent) {
					masterExtent[e] = oldMaster.extent[e];
				}
			mapSwap(mapNode, containerNode);
			setTimeout(function () {
				var onReposition = connect.connect(map, "onReposition", function () {
					setTimeout(function () {map.setExtent(masterExtent);}, 50);
				});
				map.resize();
				map.reposition();
				oldMaster.resize();
				oldMaster.reposition();
			}, 50);
			setSlave(oldMaster);
			setMaster(map);
		});
	}
	
	array.forEach(mapConfig, function (cfg, index) {
		var newMap = new Map(cfg.id, cfg.options);
		if (newMap.loaded) {
			if (!!index) {
				setSlave(newMap);
			} else {
				setMaster(newMap)
			}
		} else {
			connect.connect(newMap, "onLoad", !!index ? setSlave : setMaster);
		}
		mapArray.push(newMap);
	});
});