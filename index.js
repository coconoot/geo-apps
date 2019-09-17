      import Map from 'ol/Map.js';
      import View from 'ol/View.js';
      import {
        equalTo as equalToFilter,
        like as likeFilter,
        and as andFilter,
		between as betweenFilter
      } from 'ol/format/filter.js';
      import {WFS, GeoJSON} from 'ol/format.js';
      import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
	  import OSM from 'ol/source/OSM.js';
      import VectorSource from 'ol/source/Vector.js';
      import {Stroke, Style} from 'ol/style.js';
      import LayerSwitcher from 'ol-layerswitcher/dist/ol-layerswitcher.js';
	  import LayerGroup from 'ol/layer/Group';

      var vectorSource = new VectorSource();
      var vector = new VectorLayer({
		title: 'gemeenten',
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
          })
        })
      });
	  
	  var osm = new TileLayer({
		title: 'osm',
		type: 'base',
		visible: true,
        source: new OSM({  
        })
      });
	  
      var map = new Map({
        layers: [
		new LayerGroup({
		  'title': 'Base maps',  
		  layers: [osm]}), 
		new LayerGroup({
		  title: 'Overlays', 
		  layers: [vector]})
		],
		//layers: [osm, raster, vector],
        target: document.getElementById('map'),
        view: new View({
          center: [-8908887.277395891, 5381918.072437216],
          maxZoom: 19,
          zoom: 12
        })
      });
	  
	  var layerSwitcher = new LayerSwitcher();
      map.addControl(layerSwitcher);

      
	  
	  var featureRequest = new WFS().writeGetFeature({
        srsName: 'EPSG:3857',
        featureNS: 'https://geodata.nationaalgeoregister.nl/wijkenbuurten2018/wfs',
        featurePrefix: 'wijkenbuurten2018',
        featureTypes: ['gemeenten2018'],
        outputFormat: 'application/json',
        filter: andFilter(
		  betweenFilter('aantal_inwoners', 100000, 1000000),
		  betweenFilter('omgevingsadressendichtheid', 0,2000)
		)
	  });

      // then post the request and add the received features to a layer
      fetch('https://geodata.nationaalgeoregister.nl/wijkenbuurten2018/wfs', {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
      }).then(function(response) {
        return response.json();
      }).then(function(json) {
        var features = new GeoJSON().readFeatures(json);
        vectorSource.addFeatures(features);
        map.getView().fit(vectorSource.getExtent());
      });
	  
	  
	  /* generate a GetFeature request
      var featureRequest = new WFS().writeGetFeature({
        srsName: 'EPSG:3857',
        featureNS: 'http://openstreemap.org',
        featurePrefix: 'osm',
        featureTypes: ['water_areas'],
        outputFormat: 'application/json',
        filter: andFilter(
          likeFilter('name', 'Mississippi*'),
          equalToFilter('waterway', 'riverbank')
        )
      });

      // then post the request and add the received features to a layer
      fetch('https://ahocevar.com/geoserver/wfs', {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
      }).then(function(response) {
        return response.json();
      }).then(function(json) {
        var features = new GeoJSON().readFeatures(json);
        vectorSource.addFeatures(features);
        map.getView().fit(vectorSource.getExtent());
      }); */