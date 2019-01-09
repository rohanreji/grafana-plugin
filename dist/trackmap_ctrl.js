"use strict";

System.register(["./leaflet/leaflet.js", "moment", "app/core/app_events", "app/plugins/sdk", "./leaflet/leaflet.css!", "./partials/module.css!"], function (_export, _context) {
  "use strict";

  var L, moment, appEvents, MetricsPanelCtrl, panelDefaults, TrackMapCtrl;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  return {
    setters: [function (_leafletLeafletJs) {
      L = _leafletLeafletJs.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_appCoreApp_events) {
      appEvents = _appCoreApp_events.default;
    }, function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_leafletLeafletCss) {}, function (_partialsModuleCss) {}],
    execute: function () {
      panelDefaults = {
        maxDataPoints: 500,
        autoZoom: true,
        lineColor: 'red',
        pointColor: 'royalblue'
      };

      _export("TrackMapCtrl", TrackMapCtrl = function (_MetricsPanelCtrl) {
        _inherits(TrackMapCtrl, _MetricsPanelCtrl);

        function TrackMapCtrl($scope, $injector) {
          var _this;

          _classCallCheck(this, TrackMapCtrl);

          _this = _possibleConstructorReturn(this, _getPrototypeOf(TrackMapCtrl).call(this, $scope, $injector));

          _.defaults(_this.panel, panelDefaults);

          _this.timeSrv = $injector.get('timeSrv');
          _this.coords = [];
          _this.leafMap = null;
          _this.locationLayer = null;
          _this.polyline = null;
          _this.hoverMarker = null;
          _this.hoverTarget = null; // Panel events

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_assertThisInitialized(_this))));

          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_assertThisInitialized(_assertThisInitialized(_this))));

          _this.events.on('panel-size-changed', _this.onPanelSizeChanged.bind(_assertThisInitialized(_assertThisInitialized(_this))));

          _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_assertThisInitialized(_this)))); // Global events


          appEvents.on('graph-hover', _this.onPanelHover.bind(_assertThisInitialized(_assertThisInitialized(_this))));
          appEvents.on('graph-hover-clear', _this.onPanelClear.bind(_assertThisInitialized(_assertThisInitialized(_this))));
          return _this;
        }

        _createClass(TrackMapCtrl, [{
          key: "onInitEditMode",
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/pr0ps-trackmap-panel/partials/options.html', 2);
          }
        }, {
          key: "onPanelTeardown",
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: "onPanelHover",
          value: function onPanelHover(evt) {
            if (this.coords.length === 0) {
              return;
            } // check if we are already showing the correct hoverMarker


            var target = Math.floor(evt.pos.x);

            if (this.hoverTarget && this.hoverTarget === target) {
              return;
            } // check for initial show of the marker


            if (this.hoverTarget == null) {
              this.hoverMarker.bringToFront().setStyle({
                fillColor: this.panel.pointColor,
                color: 'white'
              });
            }

            this.hoverTarget = target; // Find the currently selected time and move the hoverMarker to it
            // Note that an exact match isn't always going to work due to rounding so
            // we clean that up later (still more efficient)

            var min = 0;
            var max = this.coords.length - 1;
            var idx = null;
            var exact = false;

            while (min <= max) {
              idx = Math.floor((max + min) / 2);

              if (this.coords[idx].timestamp === this.hoverTarget) {
                exact = true;
                break;
              } else if (this.coords[idx].timestamp < this.hoverTarget) {
                min = idx + 1;
              } else {
                max = idx - 1;
              }
            } // Correct the case where we are +1 index off


            if (!exact && idx > 0 && this.coords[idx].timestamp > this.hoverTarget) {
              idx--;
            }

            this.hoverMarker.setLatLng(this.coords[idx].position);
          }
        }, {
          key: "onPanelClear",
          value: function onPanelClear(evt) {
            // clear the highlighted circle
            this.hoverTarget = null;

            if (this.hoverMarker) {
              this.hoverMarker.setStyle({
                fillColor: 'none',
                color: 'none'
              });
            }
          }
        }, {
          key: "onPanelSizeChanged",
          value: function onPanelSizeChanged() {
            if (this.leafMap) {
              this.leafMap.invalidateSize();
            }
          }
        }, {
          key: "setupMap",
          value: function setupMap() {
            // Create the map or get it back in a clean state if it already exists
            if (this.leafMap) {
              this.onPanelClear();
              return;
            } // Create the map


            this.leafMap = L.map('trackmap-' + this.panel.id, {
              scrollWheelZoom: true,
              zoomSnap: 0.5,
              zoomDelta: 1
            });
            this.locationLayer = L.featureGroup().addTo(this.leafMap); //check
            //$('.mePin').addClass('bounce');
            //check
            // Define layers and add them to the control widget

            L.control.layers({
              'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19 //noWrap: true

              }).addTo(this.leafMap),
              // Add default layer to map
              'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                maxZoom: 17 //noWrap: true

              }),
              'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Imagery &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                // This map doesn't have labels so we force a label-only layer on top of it
                forcedOverlay: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png', {
                  attribution: 'Labels by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  subdomains: 'abcd',
                  maxZoom: 20 //noWrap: true

                })
              })
            }).addTo(this.leafMap);
            this.hoverMarker = L.circleMarker(L.latLng(0, 0), {
              color: 'none',
              fillColor: 'none',
              fillOpacity: 1,
              weight: 2,
              radius: 7
            }).addTo(this.leafMap); // Events

            this.leafMap.on('baselayerchange', this.mapBaseLayerChange.bind(this));
            this.leafMap.on('boxzoomend', this.mapZoomToBox.bind(this));
          }
        }, {
          key: "mapBaseLayerChange",
          value: function mapBaseLayerChange(e) {
            // If a tileLayer has a 'forcedOverlay' attribute, always enable/disable it
            // along with the layer
            if (this.leafMap.forcedOverlay) {
              this.leafMap.forcedOverlay.removeFrom(this.leafMap);
              this.leafMap.forcedOverlay = null;
            }

            var overlay = e.layer.options.forcedOverlay;

            if (overlay) {
              overlay.addTo(this.leafMap);
              overlay.setZIndex(e.layer.options.zIndex + 1);
              this.leafMap.forcedOverlay = overlay;
            }
          }
        }, {
          key: "mapZoomToBox",
          value: function mapZoomToBox(e) {
            // Find time bounds of selected coordinates
            var bounds = this.coords.reduce(function (t, c) {
              if (e.boxZoomBounds.contains(c.position)) {
                t.from = Math.min(t.from, c.timestamp);
                t.to = Math.max(t.to, c.timestamp);
              }

              return t;
            }, {
              from: Infinity,
              to: -Infinity
            }); // Set the global time range

            if (isFinite(bounds.from) && isFinite(bounds.to)) {
              // KLUDGE: Create moment objects here to avoid a TypeError that
              // occurs when Grafana processes normal numbers
              this.timeSrv.setTime({
                from: moment.utc(bounds.from),
                to: moment.utc(bounds.to)
              });
            }
          }
        }, {
          key: "addDataToMap",
          value: function addDataToMap() {
            //console.log(this.coords);
            this.locationLayer.clearLayers();

            for (var i = 0; i < this.coords.length; i++) {
              if (this.coords[i].pollution <= 50) var svg_cloud = '<svg class="clouds cloud-green" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0" y="0" width="512" height="512" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path id="cloud-icon" d="M406.1 227.63c-8.23-103.65-144.71-137.8-200.49-49.05 -36.18-20.46-82.33 3.61-85.22 45.9C80.73 229.34 50 263.12 50 304.1c0 44.32 35.93 80.25 80.25 80.25h251.51c44.32 0 80.25-35.93 80.25-80.25C462 268.28 438.52 237.94 406.1 227.63z"/></svg>';else if (this.coords[i].pollution <= 100) var svg_cloud = '<svg class="clouds cloud-yellow" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0" y="0" width="512" height="512" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path id="cloud-icon" d="M406.1 227.63c-8.23-103.65-144.71-137.8-200.49-49.05 -36.18-20.46-82.33 3.61-85.22 45.9C80.73 229.34 50 263.12 50 304.1c0 44.32 35.93 80.25 80.25 80.25h251.51c44.32 0 80.25-35.93 80.25-80.25C462 268.28 438.52 237.94 406.1 227.63z"/></svg>';else if (this.coords[i].pollution <= 150) var svg_cloud = '<svg class="clouds cloud-orange" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0" y="0" width="512" height="512" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path id="cloud-icon" d="M406.1 227.63c-8.23-103.65-144.71-137.8-200.49-49.05 -36.18-20.46-82.33 3.61-85.22 45.9C80.73 229.34 50 263.12 50 304.1c0 44.32 35.93 80.25 80.25 80.25h251.51c44.32 0 80.25-35.93 80.25-80.25C462 268.28 438.52 237.94 406.1 227.63z"/></svg>';else if (this.coords[i].pollution <= 200) var svg_cloud = '<svg class="clouds cloud-red" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0" y="0" width="512" height="512" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path id="cloud-icon" d="M406.1 227.63c-8.23-103.65-144.71-137.8-200.49-49.05 -36.18-20.46-82.33 3.61-85.22 45.9C80.73 229.34 50 263.12 50 304.1c0 44.32 35.93 80.25 80.25 80.25h251.51c44.32 0 80.25-35.93 80.25-80.25C462 268.28 438.52 237.94 406.1 227.63z"/></svg>';else if (this.coords[i].pollution <= 250) var svg_cloud = '<svg class="clouds cloud-purple" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0" y="0" width="512" height="512" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path id="cloud-icon" d="M406.1 227.63c-8.23-103.65-144.71-137.8-200.49-49.05 -36.18-20.46-82.33 3.61-85.22 45.9C80.73 229.34 50 263.12 50 304.1c0 44.32 35.93 80.25 80.25 80.25h251.51c44.32 0 80.25-35.93 80.25-80.25C462 268.28 438.52 237.94 406.1 227.63z"/></svg>';
              var meIcon = L.divIcon({
                className: "leaflet-data-marker",
                html: svg_cloud.replace('#', '%23'),
                iconAnchor: [22, 28],
                iconSize: [36, 42],
                popupAnchor: [0, -30]
              });
              console.log(this.coords[i] + "llll");
              var meMarker = L.marker(this.coords[i].position, {
                icon: meIcon,
                title: "AQI is " + this.coords[i].pollution + " in " + this.coords[i].location
              });
              this.locationLayer.addLayer(meMarker);
            }

            this.zoomToFit();
          }
        }, {
          key: "getMinOrMax",
          value: function getMinOrMax(latLongObj, maxMin, latLong) {}
        }, {
          key: "getBounds",
          value: function getBounds(markersObj) {
            var maxLat = getMinOrMax(markersObj, "max", "lat");
            var minLat = getMinOrMax(markersObj, "min", "lat");
            var maxLng = getMinOrMax(markersObj, "max", "lng");
            var minLng = getMinOrMax(markersObj, "min", "lng");
            var southWest = new L.LatLng(minLat, minLng);
            var northEast = new L.LatLng(maxLat, maxLng);
            return new L.LatLngBounds(southWest, northEast);
          }
        }, {
          key: "zoomToFit",
          value: function zoomToFit() {
            if (this.panel.autoZoom) {
              // this.leafMap.fitWorld();
              //       var corner1 = L.latLng(40.712, -74.227),
              // corner2 = L.latLng(40.774, -74.125),
              // bounds = L.latLngBounds(corner1, corner2);
              this.leafMap.fitBounds(this.locationLayer.getBounds().pad(0.5));
            }
          }
        }, {
          key: "refreshColors",
          value: function refreshColors() {
            if (this.polyline) {
              this.polyline.setStyle({
                color: this.panel.lineColor
              });
            }
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived(data) {
            this.setupMap();
            console.log(data.length);

            if (data.length === 0) {
              // No data or incorrect data, show a world map and abort
              this.leafMap.setView([0, 0], 1);
              return;
            }

            console.log(data); // Asumption is that there are an equal number of properly matched timestamps
            // TODO: proper joining by timestamp?

            this.coords.length = 0;

            for (var i = 0; i < data[0].datapoints.length; i++) {
              var aqi = data[0].datapoints[i][0];
              var lat = data[1].datapoints[i];
              var lon = data[2].datapoints[i];
              var city = data[3].datapoints[i][0];
              console.log(lat[0]);
              this.coords.push({
                position: L.latLng(lat[0], lon[0]),
                location: city,
                pollution: aqi,
                timestamp: lat[1]
              });
            }

            this.addDataToMap();
          }
        }]);

        return TrackMapCtrl;
      }(MetricsPanelCtrl));

      _export("TrackMapCtrl", TrackMapCtrl);

      TrackMapCtrl.templateUrl = 'partials/module.html';
    }
  };
});
//# sourceMappingURL=trackmap_ctrl.js.map
