(function () {
	var my = {};
	dojo.require("esri.map")
	my.mapInit = function () {
		my.map = new esri.Map("map");
		my.basemap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer");
        my.map.addLayer(my.basemap);
	};
	
	dojo.addOnLoad(my.mapInit);
})();