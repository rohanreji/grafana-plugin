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
              if (this.polyline) {
                this.polyline.removeFrom(this.leafMap);
              }

              this.onPanelClear();
              return;
            } // Create the map


            this.leafMap = L.map('trackmap-' + this.panel.id, {
              scrollWheelZoom: false,
              zoomSnap: 0.5,
              zoomDelta: 1
            }); //check

            var locationLayer = new L.FeatureGroup();
            var svg = '<svg id="mePin" class="bounce" xmlns="http://www.w3.org/2000/svg" width="43.3" height="42.4" viewBox="0 0 43.3 42.4"><path class="ring_outer" fill="#878787" d="M28.6 23c6.1 1.4 10.4 4.4 10.4 8 0 4.7-7.7 8.6-17.3 8.6-9.6 0-17.4-3.9-17.4-8.6 0-3.5 4.2-6.5 10.3-7.9.7-.1-.4-1.5-1.3-1.3C5.5 23.4 0 27.2 0 31.7c0 6 9.7 10.7 21.7 10.7s21.6-4.8 21.6-10.7c0-4.6-5.7-8.4-13.7-10-.8-.2-1.8 1.2-1 1.4z"/><path class="ring_inner" fill="#5F5F5F" d="M27 25.8c2 .7 3.3 1.8 3.3 3 0 2.2-3.7 3.9-8.3 3.9-4.6 0-8.3-1.7-8.3-3.8 0-1 .8-1.9 2.2-2.6.6-.3-.3-2-1-1.6-2.8 1-4.6 2.7-4.6 4.6 0 3.2 5.1 5.7 11.4 5.7 6.2 0 11.3-2.5 11.3-5.7 0-2-2.1-3.9-5.4-5-.7-.1-1.2 1.3-.7 1.5z"/><path class="mePin" d="M21.6 8.1a4 4 0 0 0 4-4 4 4 0 0 0-4-4.1 4.1 4.1 0 0 0-4.1 4 4 4 0 0 0 4 4.1zm4.9 8v-3.7c0-1.2-.6-2.2-1.7-2.6-1-.4-1.9-.6-2.8-.6h-.9c-1 0-2 .2-2.8.6-1.2.4-1.8 1.4-1.8 2.6V16c0 .9 0 2 .2 2.8.2.8.8 1.5 1 2.3l.2.3.4 1 .1.8.2.7.6 3.6c-.6.3-.9.7-.9 1.2 0 .9 1.4 1.7 3.2 1.7 1.8 0 3.2-.8 3.2-1.7 0-.5-.3-.9-.8-1.2l.6-3.6.1-.7.2-.8.3-1 .1-.3c.3-.8 1-1.5 1.1-2.3.2-.8.2-2 .2-2.8z" fill="#282828"/></svg>';
            var svg_cloud = '<svg class="clouds cloud1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0" y="0" width="512" height="512" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path id="cloud-icon" d="M406.1 227.63c-8.23-103.65-144.71-137.8-200.49-49.05 -36.18-20.46-82.33 3.61-85.22 45.9C80.73 229.34 50 263.12 50 304.1c0 44.32 35.93 80.25 80.25 80.25h251.51c44.32 0 80.25-35.93 80.25-80.25C462 268.28 438.52 237.94 406.1 227.63z"/></svg>';
            var meIcon = L.divIcon({
              className: "leaflet-data-marker",
              html: svg_cloud.replace('#', '%23'),
              iconAnchor: [22, 28],
              iconSize: [36, 42],
              popupAnchor: [0, -30]
            });
            var meMarker = L.marker(L.latLng(12.9716, 77.5946), {
              icon: meIcon,
              title: '@me'
            });
            locationLayer.addLayer(meMarker).addTo(this.leafMap); //$('.mePin').addClass('bounce');
            //check
            // Define layers and add them to the control widget

            L.control.layers({
              'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19
              }).addTo(this.leafMap),
              // Add default layer to map
              'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                maxZoom: 17
              }),
              'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Imagery &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                // This map doesn't have labels so we force a label-only layer on top of it
                forcedOverlay: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png', {
                  attribution: 'Labels by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  subdomains: 'abcd',
                  maxZoom: 20
                })
              })
            }).addTo(this.leafMap); // Dummy hovermarker

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
            this.polyline = L.polyline(this.coords.map(function (x) {
              return x.position;
            }, this), {
              color: this.panel.lineColor,
              weight: 3
            }).addTo(this.leafMap);
            this.zoomToFit();
          }
        }, {
          key: "zoomToFit",
          value: function zoomToFit() {
            if (this.panel.autoZoom) {
              this.leafMap.fitBounds(this.polyline.getBounds());
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

            if (data.length === 0 || data.length !== 2) {
              // No data or incorrect data, show a world map and abort
              this.leafMap.setView([0, 0], 1);
              return;
            } // Asumption is that there are an equal number of properly matched timestamps
            // TODO: proper joining by timestamp?


            this.coords.length = 0;
            var lats = data[0].datapoints;
            var lons = data[1].datapoints;

            for (var i = 0; i < lats.length; i++) {
              if (lats[i][0] == null || lons[i][0] == null || lats[i][1] !== lats[i][1]) {
                continue;
              }

              this.coords.push({
                position: L.latLng(lats[i][0], lons[i][0]),
                timestamp: lats[i][1]
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
