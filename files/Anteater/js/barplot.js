function plot_bar(points, context, variable, plotDims,custom = null,groupLabel = null ){
    points.forEach(function(d){d["context"] = false;})
    context.forEach(function(d){d["context"] = true})
    var colorScale = generate_color_scale(variable,custom)


    var allPts = points.concat(context);
    var name = "val1"
    if(custom!= null){
        var name = "cval1"
    }

    var mainWidth = .9*plotDims.width;

     spec = {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        config:{
          view: {
            stroke: "transparent"
          }
        },
        data: {
          values: allPts
        },
        height: plotDims.height,
        layer:[
             {
               width: mainWidth,
               selection: {
                 highlightC: {type: "single", empty: "none", on: "mouseover"},
                 selectC: {type: "multi"}
               },
               mark:"bar",
               transform:[
               {
                   filter: "datum.context"

               }],
               encoding: {
                 x: {
                    field: name,
                    type:"nominal"

                 },
                 y: {aggregate: "count"},
                 stroke:{value: "black"},
                 "fillOpacity": {
                   "condition": {"selection": "select", "value": 1},
                   "value": 0.3
                 },
                 color : {
                   condition: [
                     {
                       "test": {
                         "and": [
                           {"selection": "select"},
                           "length(data(\"select_store\"))"
                         ]
                       },
                       value: "#D4AC0D"
                     },
                     {"selection": "highlight", "value": "#D4AC0D"},
                   ],
                   "value":"gray"

                 }
                }
             },
             {
                 selection: {
                   highlight: {type: "single", empty: "none", on: "mouseover"},
                   select: {type: "multi"}
                 },
                 width: mainWidth,
                 mark:"bar",
                 transform:[
                 {
                   // filter: "!datum.context && datum."+name+"!='nan' && datum."+name+"!='inf' && datum."+name+" != '-inf'"
                     filter: "!datum.context"
                 }],
                 encoding: {
                   x: {
                     field: name,
                     type:"nominal"
                   },
                   y: {aggregate: "count"},
                   stroke:{value: "black"},
                   "fillOpacity": {
                     "condition": {"selection": "select", "value": 1},
                     "value": 0.3
                   },
                   color : {
                     condition: [
                       {
                         "test": {
                           "and": [
                             {"selection": "select"},
                             "length(data(\"select_store\"))"
                           ]
                         },
                         value: "#D4AC0D"
                       },
                       {"selection": "highlight", "value": "#D4AC0D"}
                     ],
                   }
                 }
               }


             ]
      }






    vegaEmbed('#plotView',spec,{
    //    vegaEmbed(divName, spec, {
        patch: (spec) => {
          // spec.signals.push({
          //     "name": "selectedPoints",
          //     "id": 0,
          //     "on": [{"events": "mousedown", "update": "datum"
          //
          //     }]
          // })

          return spec;
        }
      }).then(result => {
            vegaView = result.view;
            result.view.addDataListener('select_store', function(d,e){
          	    select(d,e)

          	})
            result.view.addDataListener('highlight_store', function(d,e){
          	    highlight(d,e)

          	})
            if(context.length > 0){
              result.view.addDataListener('selectC_store', function(d,e){
                  select(d,e)
              })
              result.view.addDataListener('highlightC_store', function(d,e){
                  highlight(d,e)

              })
            }







        })
        .catch(console.warn);


        function select(d,e){
          d3.selectAll("rect.execNode")
              .classed("highlighted",false)
              .style("fill",function(d){return get_fill_color(d,colorScale,custom);})
              .style("stroke",function(d){return get_stroke_color(d,colorScale);});
          d3.selectAll("rect.contextNode")
              .classed("highlighted",false)
              .style("fill","gray")
              .style("stroke","black")

            var i=0;
            //SORT

            // var valMin = Math.min(selectedBars);
            // var valMax = Math.max(selectedBars);
            var done = false
            var selected = []
            var all = []
            var binned = []

            //TODO:: Once spec is final, hard code in the first dataset to check for speed
            while(!done){
              try{
                var data = vegaView.data("data_"+i)
                if(data.length > 0 && data.length < Math.max(points.length, context.length) && "_vgsid_" in data[0]){
                  all = all.concat(data)
                }
                i++;
              }
              catch{
                done = true;
                break;
              }
            }

            var main_select = [];
            var context_select = [];
            if(vegaView.data("select_store").length > 0){
              main_select = vegaView.data("select_store");
            }

            if(context.length > 0 && vegaView.data("selectC_store").length > 0){
                context_select = vegaView.data("selectC_store")
            }

            main_select.forEach(function(s){
              var match = all.find(o=> o._vgsid_==s.values[0])
              if(match!==undefined){
                  var val = match[name];
                  var bin_points = allPts.filter(x=>x[name] == val && !x.context)
                  // selected = selected.concat(points.filter(x=> bin_points.find(o=>x[name]== o[name])!==undefined))
                  if(bin_points.length == match.__count){
                    selected = selected.concat(bin_points)
                  }
              }
            })

            context_select.forEach(function(s){
              var match = all.find(o=> o._vgsid_==s.values[0])
              if(match!==undefined){
                  var val = match[name];
                  var bin_points = allPts.filter(x=>x[name] == val && x.context)
                  // selected = selected.concat(points.filter(x=> bin_points.find(o=>x[name]== o[name])!==undefined))
                  if(bin_points.length == match.__count){
                    bin_points = bin_points.filter(x=>points.find(o=>o.id1 ==x.id1)===undefined)
                    selected = selected.concat(bin_points)
                  }

              }
            })

            selectedPoints = []
            selected.forEach(function(d){
              selectedPoints.push(d)
              var id = "#id"+d.id1;
              d3.select(id)
              .classed("highlighted",true)

              d3.select("#context" + d.id1)
              .classed("highlighted",true)

            })


        d3.selectAll(".execNode.highlighted")
        .style("fill","red")

        d3.selectAll(".contextNode.highlighted")
        .style("fill","red")

            // context.filter(x=>points.find(y=>y.id1==x.id1)===undefined)
            // while(!done){
            //     var data = vegaView.data("data_"+i)
            //     var temp = data.find(o=> o._vgsid_==e[0].values[0])
            //     if(temp !== undefined){
            //         done = true;
            //     }
            //
            // }

        }


        function highlight(d,e){
            console.log(d)
            console.log(e)
                  // if(vegaView.data("highlight_store").length > 0){
                  //     QQbounds = vegaView.data("brushQQ_store")[0].values
                  // }
                  // if(yBad && vegaView.data("brushQN_store").length > 0){
                  //     QNbounds = vegaView.data("brushQN_store")[0].values
                  // }
                  //  if(xBad && vegaView.data("brushNQ_store").length > 0){
                  //     NQbounds = vegaView.data("brushNQ_store")[0].values
                  // }
                  // if(xBad && yBad && vegaView.data("brushNN_store").length > 0){
                  //     NNbounds = vegaView.data("brushNN_store")[0].values
                  // }

        }


}
