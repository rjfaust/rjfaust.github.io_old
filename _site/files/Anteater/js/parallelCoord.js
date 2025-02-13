
var names = []
var brushActives = []
var activeExtents = {}
function plot_pc(vars,points,context,customs){
    var colorScale = generate_color_scale(vars[0],customs[0])

    for(var i = 0; i < vars.length; i++){
//        keyMap[points[0]["name"+(i+1)]] = i+1
//        custMap[points[0]["name"+(i+1)]] = customs[i];

        if(customs[i]!=null){
//            nameMap[points[0]["name"+(i+1)]] = "cval"+(i+1)
            names.push("cval"+ (i+1))
        }
        else{
//            nameMap[points[0]["name"+(i+1)]] = "val"+(i+1)
            names.push("val"+(i+1))
        }
    }

    var allPts = points.concat(context)
    var x = d3.scaleBand().range([0, plotWidth]),
    y = {},
    dragging = {};
    var topMargin = 50

    var line = d3.line(),
        axis = d3.axisLeft(),
        background,
        foreground;

    xDom = d3.range(0,vars.length,1)
    x.domain(xDom);
    xDom.forEach(function(v,i){
        var dom =d3.extent(allPts,function(d){return getValue(d,vars[v],names[i],customs[i])})
        y[v] = d3.scaleLinear()
        if(scaleInds[i] == 1){
            y[v] = d3.scaleSymlog();
        }
        y[v].domain(dom)
        .range([plotHeight,topMargin])
    })

    aggrPts = []
    var actCt =points.length;
    var contCt = context.length;

  // Add grey background lines for context.

    background = plotSVG.append("g")
      .attr("class", "background mark")
    .selectAll("path")
      .data(allPts)
    .enter().append("path")
      .attr("d", path);

// Add blue foreground lines for focus.
  foreground = plotSVG.append("g")
      .attr("class", "foreground mark")
    .selectAll("path")
      .data(allPts)
    .enter().append("path")
      .attr("d", path);


    var title=  "Plot of "

    vars.forEach(function(v,i){
        if(i>0){
            title+= " vs "
        }
        if(customs[i]){
            title += customs[i]
        }
        else{
            title += v
        }
    })
   plotSVG.append("text")
  .attr("y", 20)
  .attr("x",0)
//  .style("text-anchor","middle")
  .style("font-size","16px")
  .attr("fill","black")
  .text(title)
      // Add a group element for each dimension.
  var g = plotSVG.selectAll(".dimension")
      .data(xDom)
        .enter().append("g")
      .attr("class", "dimension mark")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.drag()
        .subject(function(d) { return {x: x(d)}; })
        .on("start", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          xDom.sort(function(a, b) { return position(a) - position(b); });
          x.domain(xDom);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("end", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

        g.append("rect")
        .attr("id",function(d){return "dim_"+d;})
        .attr("class","mark")
        .attr("height",plotHeight-topMargin)
        .style("fill","none")
        .attr("width","40px")
        .style("z-index",-100)
        .attr("y",topMargin)
        .attr("x",-25)


    g.on("contextmenu",function(d){
            d3.event.preventDefault();
            cm = d3.select("#axisMenu")

            x = d3.event.pageX
            y = d3.event.pageY
            cm.style("visibility","visible")
            cm.style("left",(x-10)+"px")
            cm.style("top",(y-10)+"px")

          })
          .on("mouseenter",function(d){
                d3.select("#dim_"+d)
                .style("fill","whitesmoke")
                .style("stroke","black")
          })
          .on("mouseleave",function(d){
                d3.select("#dim_"+d)
                .style("fill","none")
                .style("stroke","none")
          })
          // Add an axis and title.
      g.append("g")
          .attr("class", "axis")
          .style("z-index",100)
          .each(function(d,j) {
            axis.scale(y[d])
                .tickFormat(d3.format("20"))

//            if(scaleInds[j] == 1){
//
//                var step = (y[d](y[d].domain[1])-y[d](y[d].domain[0]))/10
//                var ticks = []
//                for(var i = 0; i < 11; i++){
//                    ticks.push(y[d].invert(y[d](y[d].domain[0])+i*step))
//                }
//                axis.tickFormat(d3.format(".0e"))
//                axis.tickValues(ticks)
//            }
              d3.select(this).call(axis);

          })

        .append("text")
          .attr("y", 20)
          .style("text-anchor","middle")
          .style("font-size","16px")
          .attr("transform","translate(0," + plotHeight + ")")
          .attr("fill","black")
          .text(function(d) {
            if(customs[d]){
                return customs[d]
            }
            return vars[d]; });



      // Add and store a brush for each axis.
      g.append("g")
          .attr("class", "brush")
          .each(function(d) {
            y[d].brush = d3.brushY(y[d])
            .extent([[-10,topMargin],[+10,plotHeight]])
            .on("start", brushstart)
            .on("brush", brush)
            .on("end",brushend)
            d3.select(this).call(y[d].brush);
          })
        .selectAll("rect")
//        .attr("class","brushR")
            .style("z-index",101)
          .attr("x", -8)
          .attr("width", 16);



    function position(d) {
      var v = dragging[d];
      return v == null ? x(d) : v;
    }

    function transition(g) {
      return g.transition().duration(500);
    }


    // Returns the path for a given data point.
    function path(d) {
//        var data = []
//        vars.forEach(function(v,i){
//            data.push([position(i),y[i](getValue(d,v,names[i],customs[i]))])
//        })
//        console.log(data)
//    console.log(vars.map(function(p,i) {return [position(p), y[p](getValue(d,"","val"+keyMap[p]))];}))
//        var v = d3.range(0,vars.length,1)
      return line(xDom.map(function(p) {return [position(p), y[p](getValue(d,vars[p],names[p],customs[p]))];}));
        return line(data)
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
        d3.select("rect.execNode")
        .classed("highlighted",false)
        .style("fill",function(d){return get_fill_color(d,colorScale,customs[0])})
        .style("stroke",function(d){return "white"})

        d3.selectAll("rect.contextNode")
        .classed("highlighted",false)
        .style("fill","gray")
        .style("stroke","black")
    }
    function brushend() {
        e = d3.brushSelection(this)
        if(!e){
            d3.selectAll(".execNode")
            .style("fill",function(d){return get_fill_color(d,colorScale,customs[0])})

            d3.selectAll(".contextNode")
            .style("fill","gray")

//            d3.selectAll("circle.mark")
//            .classed("selected",false)
//            .style("fill",function(d,i){return get_mark_color(d,i,contEnd)})
            var d= d3.select(this).data()[0];
            var i = brushActives.indexOf(d)
            brushActives.splice(i,1)
            var actives = xDom.filter(function(p) { return brushActives.indexOf(p)>=0; }),
              extents = actives.map(function(p) { return activeExtents[p]; });


          foreground.style("display", function(d) {
            return actives.every(function(p,i) {
                var v = getValue(d,vars[p],names[p],customs[p])
                var shown = extents[i][0] <= y[p](v) && y[p](v) <= extents[i][1];

                if(shown){
                    for(var j = 0; j < vars.length; j++){
                        var id = "#id" + d["id"+(j+1)]
                        d3.select(id)
                        .classed("highlighted",true)

                        d3.select("#context" + id)
                        .classed("highlighted",true)

                    }

                }
                return shown;
            }) ? null : "none";
      });
        }

    }
    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var b = d3.select(this)
        var d = b.data()[0]
        if(brushActives.indexOf(d)<0){
            brushActives.push(d)
        }
        activeExtents[d] =  d3.event.selection;

      var actives = xDom.filter(function(p) { return brushActives.indexOf(p)>=0; }),
          extents = actives.map(function(p) { return activeExtents[p]; });

        d3.selectAll("rect.execNode")
            .classed("highlighted",false)
            .style("fill",function(d){return get_fill_color(d,colorScale,customs[0]);})
            .style("stroke",function(d){return get_stroke_color(d,colorScale);});

        d3.selectAll("rect.contextNode")
            .classed("highlighted",false)
            .style("fill","gray")
            .style("stroke","black")

      foreground.style("display", function(d) {
        return actives.every(function(p,i) {
            var v = getValue(d,vars[p],names[p],customs[p])
            var shown = extents[i][0] <= y[p](v) && y[p](v) <= extents[i][1];

            if(shown){
                for(var j = 0; j < vars.length; j++){
                    var id = "#id" + d["id"+(j+1)]
                    d3.select(id)
                    .classed("highlighted",true)

                    d3.select("#context" + id)
                    .classed("highlighted",true)
                }
            }
            return shown;
        }) ? null : "none";
      });
        d3.selectAll(".execNode.highlighted")
        .style("fill","red")

        d3.selectAll(".contextNode.highlighted")
        .style("fill","red")
    }
}













