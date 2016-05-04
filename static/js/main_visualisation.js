var mainVizApp = angular.module('MainVizApp', [], function ($interpolateProvider) {
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');
});

mainVizApp.controller('MonitoringGermanyCtrl', function ($scope) {

	var dataGermany = indicatorProvider.getLastScoringForCountry("Germany").slice();

	dataGermany.sort(function (a, b) {
		return a.score - b.score;
	});

	var filterByScoring = function (element) {
		var score = element.score;
		var filteredData = $scope.showedData.filter(function (d) {
			return (d.score === score ? true : false);
		}).sort(function (a, b) {
			var nameA = a.name.toLowerCase(),
				nameB = b.name.toLowerCase();
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		});
		return filteredData;
	};
	var filterArrayElement = function (element, id) {
		return element.filter(function (d) {
			return (d === id ? true : false);
		});
	};

	$scope.data = dataGermany;
	$scope.showedData = dataGermany;
	$scope.visibility = false;
	$scope.detailData = null;

	$scope.sdgFiltering = function (id) {
		var filteredData = $scope.data.filter(function (d) {
			return (filterArrayElement(d.sdg, id).length > 0);
		}).sort(function (a, b) {
			return a.score - b.score;
		});
		$scope.showedData = filteredData;
		redraw();
	};

	$scope.responsibility = function (id) {
		var filteredData = $scope.data.filter(function (d) {
			return (filterArrayElement(d.responsibility, id).length > 0);
		}).sort(function (a, b) {
			return a.score - b.score;
		});
		$scope.showedData = filteredData;
		redraw();
	};

	$scope.type = function (id) {
		var filteredData = $scope.data.filter(function (d) {
			return (d.type === id ? true : false);
		}).sort(function (a, b) {
			return a.score - b.score;
		});
		$scope.showedData = filteredData;
		redraw();
	};
	var color = d3.scale.ordinal()
		.domain([1, 2, 3, 4, 5])
		.range(['#2c7bb6', '#abd9e9', '#ffe89d', '#fdae61', '#d7191c']);

	var categories = ['Sehr hohe Nachhaltigkeit', 'hohe Nachhaltigkeit', 'mittlere Nachhaltigkeit',
		'geringe Nachhaltigkeit', 'sehr geringe Nachhaltigkeit', 'kein Wert vorhanden'];

	var el = document.getElementById('newViz');

	var margin = {top: 40, bottom: 10, left: 10, right: 10};
	var width = el.clientWidth - margin.left - margin.right;
	var height = 100 - margin.top - margin.bottom;

	var n = dataGermany.length;

	var x = d3.scale.ordinal()
		.domain(d3.range(n))
		.rangeBands([0, width], 0.1, 0.2);

	var svg = d3.select('#newViz')
		.append('svg')
		.attr("width", '100%')
		.attr("height", '100%')
		.attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
		.attr('preserveAspectRatio', 'xMaxYMax')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	svg.append('text')
		.attr('y', -10)
		.text('sehr hohe Nachhaltigkeit');

	svg.append('text')
		.attr('y', -10)
		.attr('x', width)
		.style('text-anchor', 'end')
		.text('sehr geringe Nachhaltigkeit');

	redraw();

	function redraw(filter) {
		$scope.visibility = false;
		var rect = svg.selectAll('.rect')
			.data($scope.showedData);

		rect.enter().append('rect')
			.attr("class", "rect")
			.attr('id', function (d) {
				return 'id-' + d.indicator;
			})
			.attr('height', x.rangeBand())
			.attr("width", x.rangeBand())
			.on('mouseover', function () {
				d3.select(this).classed('hover', true);
			})
			.on('mouseout', function () {
				d3.select(this).classed('hover', false);
			})
			.on('click', function (d) {
				$scope.$apply(function () {
					if ($scope.data.length !== $scope.showedData.length) {
						// zuerst nach den sdgs suchen
						// danach die daten anhand der sdg's filtern
						return;
					} else {
						var data = filterByScoring(d);
						$scope.visibility = true;
						$scope.detailData = [{
							headline: categories[(d.score - 1)],
							data: data,
							count: data.length,
							width: x.rangeBand(),
							color: color(d.score)
						}];
					}
				});
			});

		rect.transition()
			.duration(500)
			.attr("x", function (d, i) {
				return x(i);
			})
			.style('fill', function (d) {
				return color(d.score);
			});

		rect.exit().remove();
	}
});

mainVizApp.filter('range', function () {
	return function (val, range) {
		range = parseInt(range);
		for (var i = 0; i < range; i++)
			val.push(i);
		return val;
	};
});
