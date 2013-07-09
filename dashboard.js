(function () {

  function Chart(selector) {
    this.root = selector;
  }

  Chart.prototype.setupDimension = function (dimension) {
    this.width = dimension.width;
    this.height = dimension.height;
    this.margin = { top: 10, right: 10, bottom: 10, left: 10 }
    this.svgWidth = dimension.width + dimension.margin.left + dimension.margin.right;
    this.svgHeight = dimension.height + dimension.margin.top + dimension.margin.bottom;
    return this;
  }

  Chart.prototype.setupSvg = function (config) {
    this.svg = d3.select(this.root).append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .append('g')


    if (config && config.transform) {
      config.transform.apply(null, [this])
    } else {
      this.svg.attr('transform', 'translate(' + this.margin.top + ', ' + this.margin.left + ')')
    }

    return this;
  }

  Chart.prototype.initBarChart = function (dataset, config) {
    var self = this;

    self.barWidth = 10;
    self.barPadding = 7;

    this.yScale = d3.scale.linear().domain([1, 10]).rangeRound([10, 50])
    this.bars = self.svg.selectAll('svg__bar')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'svg__bar')
      .attr('x', function (d, i) {
        return i * (self.barWidth + self.barPadding);
      })
      .attr('width', self.barWidth)
      .attr('y', function (d, i) {
        return self.height
      })
      .attr('height', 0)
      .transition()
      .duration(700)
      .attr('y', function (d) {
        return self.height - self.yScale(d);
      })
      .attr('height', function (d) {
        return self.yScale(d);
      })

    return this;
  }

  Chart.prototype.initRGBarChart = function (dataset, config) {
    function bg(dataset) {
      var a = []
      for (var i = 0; i < dataset.length; i++) {
        a.push(10)
      }
      return a
    }

    function initBars(svg, dataset, selector) {

      return svg.selectAll(selector)
        .data(dataset)
        .enter()
        .append('rect')
        .attr('class', selector)
        .attr('x', function (d, i) {
          return i * (self.barWidth + self.barPadding);
        })
        .attr('width', self.barWidth)

    }

    function svgBarColor(d) {
      return d < 0 ? '#fa5d55' : '#4acab3';
    }

    var self = this;
    var config = config || {}

    self.barWidth = config.barWidth || 16;
    self.barPadding = config.barPadding || 12;

    this.yScale = d3.scale.linear().domain([1, 10]).rangeRound([10, this.height])

    this.bars = initBars(this.svg, bg(dataset), 'svg__bar')
      .attr('y', function (d) {
        return self.height - self.yScale(d);
      })
      .attr('height', function (d) {
        return self.yScale(d);
      })

    initBars(this.svg, dataset, 'svg__red-bar')
      .attr('fill', svgBarColor)
      .attr('y', function (d, i) {
        return self.height
      })
      .attr('height', 0)
      .transition()
      .duration(700)
      .attr('y', function (d) {
        return self.height - self.yScale(Math.abs(d));
      })
      .attr('height', function (d) {
        return self.yScale(Math.abs(d));
      })


  }

  Chart.prototype.initLineChart = function (dataset) {
    var self = this;
    var xScale, yScale;

    xScale = d3.scale.linear()
      .domain([0, 7]).rangeRound([0, self.width])

    yScale = this.yScale

    this.line = d3.svg.line()
      .interpolate('linear')
      .x(function (d, i) {
        return xScale(i);
      })
      .y(function (d) {
        return this.height - yScale(d);
      })

    function lineTween() {
      var it = d3.interpolate(0, 7)

      return function (t) {
        return self.line(dataset.slice(0, it(t) + 1))
      }
    }

    this.svg.append('path')
      .style('fill', 'none')
      .transition()
      .duration(700)
      .attrTween('d', lineTween)

    return this;

  }

  Chart.prototype.initPieChart = function (dataset) {

    var radius = 140;

    var color = function (i) {
      var colors = ['#4acab4', '#878bb6', '#ff8153', '#ffea88']
      return colors[i]
    }

    var pie = d3.layout.pie()
      .value(function (d) {
        return d;
      })
      .sort(null)

    var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 45)

    function arcTween(data) {
      return function (t) {
        var i = d3.interpolate({ startAngle: 0, endAngle: 0}, data)
        return arc(i(t));
      }
    }

    this.svg.selectAll('path')
      .data(pie(dataset))
      .enter().append('path')
      .attr('fill', function (d, i) {
        return color(i);
      })
      .transition()
      .duration(700)
      .attrTween('d', arcTween)

    return this;


  }

  Chart.prototype.initProgressBar = function (data) {

    var scale = d3.scale.linear()
      .domain([0, 100]).rangeRound([0, this.width])

    this.svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('class', 'progress-bar--background')
      .attr('height', this.height)
      .attr('width', this.width)

    this.svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('class', 'progress-bar--foreground')
      .attr('height', this.height)
      .attr('width', 0)
      .transition()
      .duration(700)
      .attr('width', scale(data))
  }

  Chart.prototype.initArcProgressBar = function (data) {
    var startAngle = -2.5, endAngle = 2.5, radius = 50;
    var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 15)

    var scale = d3.scale.linear()
      .domain([0, 100]).rangeRound([startAngle, endAngle])

    var pie = d3.layout.pie()
      .startAngle(-2.5)
      .endAngle(scale(data))

    function arcTween(data) {
      var i = d3.interpolate({startAngle: startAngle, endAngle: startAngle}, data)
      return function (t) {
        return arc(i(t));
      }
    }

    this.svg.append('path')
      .attr('class', 'arc-progress-bar--background')
      .attr('d', arc({startAngle: startAngle, endAngle: endAngle}))

    this.svg.append('path')
      .data(pie([data]))
      .attr('class', 'arc-progress-bar--foreground')
      .transition()
      .duration(700)
      .attrTween('d', arcTween)

    return this;

  }

  function invoiceChart() {
    var dataset = [5, 4, 6, 3, 9, 5, 6, 4]
    var chart = new Chart('.widget__invoice-chart')

    chart.setupDimension({
      width: 129,
      height: 35,
      margin: { top: 10, right: 10, bottom: 10, left: 10}
    }).setupSvg().initBarChart(dataset).initLineChart(dataset.map(function (d) {
        return d / 2
      }))
  }

  function downloadChart() {
    var dataset = [3, 7, 6, 9, 10, 4, 5, 2]
    var chart = new Chart('.widget__download-chart')

    chart.setupDimension({
      width: 129,
      height: 30,
      margin: { top: 10, right: 10, bottom: 10, left: 10}
    }).setupSvg().initBarChart(dataset).initLineChart(dataset.map(function (d) {
        return d / 2
      }))
  }

  function distrbutionChart() {
    var dataset = [38, 26, 17, 9];

    var chart = new Chart('.widget__distribution-chart')

    chart.setupDimension({
      width: 280,
      height: 280,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    }).setupSvg({ transform: function (chart) {
        chart.svg.attr("transform", "translate(" + chart.svgWidth / 2 + "," + chart.svgHeight / 2 + ")");
      }}).initPieChart(dataset)
  }

  function marketingBudgetChart() {
    var dataset = 75;

    var chart = new Chart('.widget__marketing-budget-chart')

    chart.setupDimension({
      width: 129,
      height: 15,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    }).setupSvg().initProgressBar(dataset)
  }

  function storageChart() {
    var dataset = 65;

    var chart = new Chart('.widget__storage-chart')

    chart.setupDimension({
      width: 100,
      height: 100,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    }).setupSvg({ transform: function (chart) {
        chart.svg.attr("transform", "translate(" + chart.svgWidth / 2 + "," + chart.svgHeight / 2 + ")");
      }}).initArcProgressBar(dataset)
  }

  function revenueChart() {
    var dataset = [-7, -6, -4, 5, 6, 7, 8, 9, -6, -4, 5, 7, 8, -8, -7]

    var chart = new Chart('.widget__revenue-chart')

    chart.setupDimension({
      width: 400,
      height: 65,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    }).setupSvg().initRGBarChart(dataset)

  }

  function fileUploadedChart() {
    var dataset = 78;

    var chart = new Chart('.widget__file-uploaded-chart')

    chart.setupDimension({
      width: 129,
      height: 15,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    }).setupSvg().initProgressBar(dataset)
  }

  function yearlyChangeChart() {
    var dataset = [6, 7, -9, -1, -4, 10, 7, 2]

    var chart = new Chart('.widget__yearly-change-chart')

    chart.setupDimension({
      width: 166,
      height: 50,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    }).setupSvg().initRGBarChart(dataset, { barWidth: 12, barPadding: 10})
  }


  window.onload = function () {
    invoiceChart();
    downloadChart();
    distrbutionChart();
    marketingBudgetChart();
    storageChart();
    revenueChart();
    fileUploadedChart();
    yearlyChangeChart();
  }

})()