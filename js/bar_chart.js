 d3.csv("data/bar_chart_data.csv").then(function(data){

      var years = ['2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011']

      d3.select('#interval').selectAll('option')
          .data(years)
        .enter().append('option')
          .text(function(d) { return d; });

      function redraw() {
        var year = d3.select('#interval').nodes()[0].value;
        filteredData = data.filter(function(d) { if(d.year == year){ return d; }})
        var numberBars = d3.select('#categories').nodes()[0].value; // Show only top n

        let barChart = dc.barChart('#barchart');
        barChart.resetSvg();

        let facts = crossfilter(filteredData);

        let categoryDim = facts.dimension(function(d){
            return d.category;
        });

        let amountGroup = categoryDim.group().reduceSum(function(d) {
            return d.amount;
        });

        function getTops(source_group) {
            return {
                all: function () {
                    return source_group.top(numberBars);
                }
            };
        }

        var sortByCategory = filteredData.sort(function (a, b) { return a.category < b.category; });
        var names = sortByCategory.map(function (d) { return d.category; });

        let _sizeBarChart = barChart.root().node().parentNode.getBoundingClientRect();

        barChart.width(_sizeBarChart.width)
                 .height(_sizeBarChart.height)
                 .margins({top: 50, right: 50, bottom: 50, left: 50})
                 .dimension(categoryDim)
                 .x(d3.scaleBand().domain(names.slice(0, numberBars)))
                 .xUnits(dc.units.ordinal)
                 .yAxisLabel('Número de ocorrências')
                 .barPadding(0.1)
                 .brushOn(false)
                 .group(getTops(amountGroup));

        barChart.on("renderlet", function(chart){
            chart.selectAll("#barchart svg")
              .attr("height", 500)

            chart.selectAll("#barchart svg .x text")
              .style("transform", " rotate(-45deg) translate(-70px,0px)");
        });

        dc.renderAll();
      }

      redraw();
      d3.select('#interval').on('change', redraw);
      d3.select('#categories').on('change', redraw);
    });