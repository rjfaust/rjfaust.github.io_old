function plot_hist(points, context, variable, plotDims,custom = null,groupLabel = null ){
    points.forEach(function(d){d["context"] = false;})
    context.forEach(function(d){d["context"] = true})
    var colorScale = generate_color_scale(variable,custom)


    var allPts = points.concat(context);
    var name = "val1"
    if(custom!= null){
        var name = "cval1"
    }
    var numVals = allPts.filter(function(d){var v = getValue(d,variable,name,custom); return ( v!= "nan" && v!="inf"
    && v!= "-inf" && v!= "Anteater:Expression_Error")})
    numVals.forEach(function(v){
      v[name] = parseFloat(v[name]);
    })
    var bads = false;



    if(numVals.length != allPts.length){
        bads = true;
    }

    var nonNums = filter_non_nums(allPts,variable,name,custom)

    var mainWidth = plotDims.width;
    var extraWidth=0;
    if(bads){
      mainWidth = .80*plotDims.width;
      extraWidth = .2*plotDims.width;
    }

    var title = "Histogram of \""
    var xName = variable
    if(custom!=null){
        xName = custom
    }
    title+=xName
    title += "\""

    if(groupLabel != null){
        title+= " with "+groupLabel
    }

    xScale = "linear"
    yScale = "linear"

    if (scaleInds[0]==1){
        xScale = "symlog"
    }
    if (scaleInds[1]==1){
        yScale="symlog"
    }

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
      }
        var layer = [
          // {
          //   mark:"bar",
          //   transform:[
          //   {
          //     filter: "datum.context && (datum."+name+"=='nan' || datum."+name+"=='inf' || datum."+name+" == '-inf')"
          //   }],
          //   encoding: {
          //     x: {
          //       field: name,
          //       axis:null
          //     },
          //     y: {aggregate: "count"},
          //     opacity:{"value":0}
          //
          //   }
          // },
          // {
          //   mark:"bar",
          //   transform:[
          //   {
          //     filter: "!datum.context && (datum."+name+"=='nan' || datum."+name+"=='inf' || datum."+name+" == '-inf')"
          //   }
          //   ],
          //   encoding: {
          //     x: {
          //       field: name,
          //       axis:null
          //     },
          //     y: {aggregate: "count"},
          //     opacity:{"value":0}
          //   },
          // },
          {
            width: mainWidth,
            selection: {
              highlightC: {type: "single", empty: "none", on: "mouseover"},
              selectC: {type: "multi"}
            },
            mark:"bar",
            transform:[
            {
                filter: "datum.context && datum."+name+"!='nan' && datum."+name+"!='inf' && datum."+name+" != '-inf'"

            }],
            encoding: {
              x: {
                bin: true,
                field: name,
                scale: xScale
              },
              y: {aggregate: "count", scale: yScale},
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
          {        title: title,

              selection: {
                highlight: {type: "single", empty: "none", on: "mouseover"},
                select: {type: "multi"}
              },
              width: mainWidth,
              mark:"bar",
              transform:[
              {
                // filter: "!datum.context && datum."+name+"!='nan' && datum."+name+"!='inf' && datum."+name+" != '-inf'"
                  filter: "!datum.context && datum."+name+"!='nan' && datum."+name+"!='inf' && datum."+name+" != '-inf'"
              }],
              encoding: {
                x: {
                  bin: true,
                  field: name,
                  axis:{title:xName},
                  scale:xScale
                },
                y: {aggregate: "count",scale:yScale},
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



    // if(context.length > 0){
    //   var cont =
    //   // layer = [cont].concat(layer);
    //   layer.splice(2,0,cont)
    // }

      if (bads){
        var extensions = {
            layer:[
              {
                width: extraWidth,
                mark:"bar",
                transform:[
                {
                  filter: "!datum.context && datum."+name+"!='nan' && datum."+name+"!='inf' && datum."+name+" != '-inf'"
                }],
                encoding: {
                  x: {
                    bin: true,
                    field: name,
                    axis:null,
                    scale:xScale
                  },
                  y: {aggregate: "count",
                    axis:{
                      title: null,
                      ticks: false,
                      labels: false

                    },
                    scale:yScale
                  },
                  opacity:{value: 0}
                }
              },
              {
                width: extraWidth,
                mark:"bar",
                transform:[
                {
                  filter: "datum.context && datum."+name+"!='nan' && datum."+name+"!='inf' && datum."+name+" != '-inf'"
                }],
                encoding: {
                  x: {
                    bin: true,
                    field: name,
                    axis:null,
                    scale:xScale
                  },
                  y: {aggregate: "count",scale:yScale},
                  opacity:{value: 0}
                }
              },
              {
                layer:[
                  {
                selection: {
                  highlightCExt: {type: "single", empty: "none", on: "mouseover"},
                  selectCExt: {type: "multi"}
                },
                width: extraWidth,
                mark:"bar",
                transform:[
                {
                  filter: "datum.context && (datum."+name+"=='nan' || datum."+name+"=='inf' || datum."+name+" == '-inf')"
                }],
                encoding: {
                  x: {
                    field: name,
                  },
                  y: {aggregate: "count", scale:yScale},
                  color:{"value":"grey"},
                  "fillOpacity": {
                    "condition": {"selection": "selectCExt", "value": 1},
                    "value": 0.3
                  },
                  stroke:{value: "black"},
                  "strokeWidth": {
                    "condition": [
                      {
                        "test": {
                          "and": [
                            {"selection": "selectCExt"},
                            "length(data(\"selectCExt_store\"))"
                          ]
                        },
                        "value": 2
                      },
                      {"selection": "highlightCExt", "value": 1}
                    ],
                    "value": 0
                  }
                }
              },
              {
                selection: {
                  highlightExt: {type: "single", empty: "none", on: "mouseover"},
                  selectExt: {type: "multi"}
                },
                width: extraWidth,
                mark:"bar",
                transform:[
                {
                  filter: "!datum.context  && (datum."+name+"=='nan' || datum."+name+"=='inf' || datum."+name+" == '-inf')"
                }],
                encoding: {
                  x: {
                    field: name,
                    axis:{
                      title:null
                    }
                  },
                  y: {aggregate: "count", scale: yScale},
                  // color:{
                  //   field: name
                  // },
                  color : {
                    condition: [
                      {
                        "test": {
                          "and": [
                            {"selection": "selectExt"},
                            "length(data(\"selectExt_store\"))"
                          ]
                        },
                        value: "#D4AC0D"
                      },
                      {"selection": "highlightExt", "value": "#D4AC0D"}
                    ],
                    field: name
                  },
                  "fillOpacity": {
                    "condition": {"selection": "selectExt", "value": 1},
                    "value": 0.3
                  },
                  stroke:{value: "black"},
                  "strokeWidth": {

                    "value": 1
                  }
                }
              }
              ],
              resolve:{scale:{x:"shared"}}
              }
            ]

          }
        spec.hconcat=[{"layer":layer,"resolve":{"scale": {"x": "shared"}}},extensions]
        spec.resolve= {"scale": {"y": "shared"}}

      }
      else{
        spec.layer = layer;
        spec.resolve = {"scale": {"x": "shared"}}
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
          	    select(d,e)

          	})
            if(context.length > 0){
              result.view.addDataListener('selectC_store', function(d,e){
                  select(d,e)
              })
              result.view.addDataListener('highlightC_store', function(d,e){
                  select(d,e)

              })

            }
            if(bads){

              result.view.addDataListener('selectCExt_store', function(d,e){
            	    select(d,e)
            	})
              result.view.addDataListener('selectExt_store', function(d,e){
            	    select(d,e)
            	})
              result.view.addDataListener('highlightExt_store', function(d,e){
            	    select(d,e)

            	})
              result.view.addDataListener('highlightCExt_store', function(d,e){
                  select(d,e)

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
                else if(data.length == points.length+context.length && "bin_maxbins_10_"+name in data[0]){
                  binned = data;
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
            var ext_context_select = [];
            var ext_select = [];
            if(vegaView.data("select_store").length > 0){
              main_select = vegaView.data("select_store");
            }
            if(vegaView.data("highlight_store").length > 0){
              main_select = main_select.concat(vegaView.data("highlight_store"))
            }

            if(context.length > 0 && vegaView.data("selectC_store").length > 0){
                context_select = vegaView.data("selectC_store")
            }
            if(vegaView.data("highlightC_store").length > 0){
              context_select = context_select.concat(vegaView.data("highlightC_store"))
            }
            if(bads){
              if(vegaView.data("selectCExt_store").length > 0){
                ext_context_select = vegaView.data("selectCExt_store");
              }
              if(vegaView.data("highlightCExt_store").length > 0){
                ext_context_select = ext_context_select.concat(vegaView.data("highlightCExt_store"))
              }
              if(vegaView.data("selectExt_store").length > 0){
                ext_select = vegaView.data("selectExt_store");
              }
              if(vegaView.data("highlightExt_store").length > 0){
                ext_select = ext_select.concat(vegaView.data("highlightExt_store"))
              }
            }

            main_select.forEach(function(s){
              var match = all.find(o=> o._vgsid_==s.values[0])
              if(match!==undefined){
                  var bin_min = match["bin_maxbins_10_"+name]
                  var bin_max = match["bin_maxbins_10_"+name+"_end"]
                  var bin_points = binned.filter(x=>x["bin_maxbins_10_"+name] == bin_min && x["bin_maxbins_10_"+name+"_end"]==bin_max && !x.context)
                  // selected = selected.concat(points.filter(x=> bin_points.find(o=>x[name]== o[name])!==undefined))
                  if(bin_points.length == match.__count){
                    selected = selected.concat(bin_points)
                  }
              }
            })

            context_select.forEach(function(s){
              var match = all.find(o=> o._vgsid_==s.values[0])
              if(match!==undefined){
                  var bin_min = match["bin_maxbins_10_"+name]
                  var bin_max = match["bin_maxbins_10_"+name+"_end"]
                  var bin_points = binned.filter(x=>x["bin_maxbins_10_"+name] == bin_min && x["bin_maxbins_10_"+name+"_end"]==bin_max && x.context)
                  // selected = selected.concat(points.filter(x=> bin_points.find(o=>x[name]== o[name])!==undefined))
                  if(bin_points.length == match.__count){
                    bin_points = bin_points.filter(x=>points.find(o=>o.id1 ==x.id1)===undefined)
                    selected = selected.concat(bin_points)
                  }

              }
            })
            ext_select.forEach(function(s){
              var match = all.find(o=> o._vgsid_==s.values[0])
              if(match!==undefined){
                  var val = match[name];
                  var bin_points = binned.filter(x=>x[name] == val && !x.context)
                  // selected = selected.concat(points.filter(x=> bin_points.find(o=>x[name]== o[name])!==undefined))
                  // bin_points.filter(x=>points.find(o=>o.id1 ==x.id1)===undefined)
                  if(bin_points.length == match.__count){
                    selected = selected.concat(bin_points)
                  }
              }
            })
            ext_context_select.forEach(function(s){
              var match = all.find(o=> o._vgsid_==s.values[0])
              if(match!==undefined){
                var val = match[name];
                var bin_points = binned.filter(x=>x[name] == val && x.context)
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


        }



        d3.select("#plotView")
        .on("contextmenu",function(e){
            d3.event.preventDefault();
            cm = d3.select("#plotCMenu")

            xCoord = d3.event.pageX
            yCoord = d3.event.pageY
            cm.style("visibility","visible")
            cm.style("left",(xCoord-10)+"px")
            cm.style("top",(yCoord-10)+"px")

        })
}
