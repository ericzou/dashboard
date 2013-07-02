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

  Chart.prototype.initBarChart = function (dataset) {
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
      .attr('y', function (d, i) {
        return self.height
      })
      .attr('width', self.barWidth)
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
        chart.svg.attr("transform", "translate(" + chart.width / 2 + "," + chart.height / 2 + ")");
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


  window.onload = function () {
    invoiceChart();
    downloadChart();
    distrbutionChart();
    marketingBudgetChart();
  }

})()