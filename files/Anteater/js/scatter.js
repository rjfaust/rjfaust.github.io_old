var infColor = "blue"
var nanColor = "green"
var nanContColor = "#79d279"
var infContColor = "#8080ff"


function plot_scatter(points, context, xVar, yVar, plotDims, customX = null, customY = null, groupLabel = null,connect = false){

    var colorScale = generate_color_scale(xVar,customX)
    plotSVG = d3.select("#group_" + plotDims.ind)
    points.forEach(function(d){d["context"] = false})
    context.forEach(function(d){d["context"] = true})

    var allPts = context.concat(points)
    var allX = allPts
    var allY = allPts
    var xBad = false;
    var yBad = false;
    var xNumber = (xVar=="timestamp"||trackedTypes[xVar]==typeof(4))
    var yNumber = (yVar=="timestamp"||trackedTypes[yVar]==typeof(4))

    var yname = "val2"
    var xname = "val1"


    if (customY !=null && xVar != "timestamp"){
        yname = "cval2"
        yNumber = (yVar=="timestamp"||trackedTypes_expr[yVar][customY]==typeof(4))
    }
    else if(customY != null){
        yname = "cval1"
        yNumber = (yVar=="timestamp"||trackedTypes_expr[yVar][customY]==typeof(4))
        xname = "timestamp1"
    }
    else if(xVar == "timestamp" && customY == null){
        yname = "val1"
        xname = "timestamp1"
    }

    if(customX != null){
        xname = "cval1"
        xNumber = (xVar=="timestamp"||trackedTypes_expr[xVar][customX]==typeof(4))
    }

    if(xVar!="timestamp"){
        allX = allPts.filter(function(d){return d.name1 == xVar;})

        if(xNumber){
            numX = allX.filter(function(d){return (d[xname]!="nan" && d[xname]!="inf" && d[xname]!="-inf" && d[xname]!= "Anteater:Expression_Error")})

            if(numX.length < allX.length){
                xBad = true;
            }
        }
    }
    else{
        colorScale = generate_color_scale(yVar,customY)
    }


    if(yVar != "timestamp"){
        if(xVar != "timestamp"){
            allY = allPts.filter(function(d){return d.name2 == yVar;})
        }
        else{
            allY = allPts.filter(function(d){return d.name1 == yVar;})
        }
        if(yNumber){

            var numY = allY.filter(function(d){return (d[yname]!="nan" && d[yname]!="inf" && d[yname]!="-inf" && d[yname]!= "Anteater:Expression_Error")})

            if(numY.length < allY.length){
                yBad = true;
            }
        }

    }
    else{
        yname = "timestamp1"
    }

    if(xBad){
        nonnumX = allPts.filter(function(d){return (d[xname]=="nan" || d[xname]=="inf" || d[xname]=="-inf" || d[xname]== "Anteater:Expression_Error")})
        nonnumX.forEach(function(d){

        })

    }


    xScale = "linear"
    yScale = "linear"

    if (scaleInds[0]==1){
        xScale = "symlog"
    }
    if (scaleInds[1]==1){
        yScale="symlog"
    }

    vegaView = null
    divName = "#group_" + plotDims.ind

    mainHeight = plotDims.height;
    mainWidth = plotDims.width;
    qnWidth = 0
    qnHeight = 0
    nqWidth = 0
    nqHeight = 0
    nnWidth = 0
    nnHeight = 0

    if(xBad && !yBad){
      mainWidth = .85*plotDims.width;
      // nqWidth = .1*plotDims.width;
      // nqHeight = plotDims.height;
    }
    else if(yBad && !xBad){
      mainHeight = .9*plotDims.height;
      // qnHeight = .1*plotDims.height;
      mainWidth = plotDims.width*.95;
    }
    else if(yBad && xBad){
      // mainHeight = .9*plotDims.height;
      mainWidth = .85*plotDims.width;

      // qnHeight = .1*plotDims.height;
      // qnWidth = .9*plotDims.width;
      //
      // nqWidth = .1*plotDims.width;
      // nqHeight = .9*plotDims.height;
      //
      // nnWidth = .1*plotDims.width;
      // nnHeight = .1*plotDims.height;

    }



    spec = {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: {values: allPts},
        height: plotDims.height,
        hconcat:[
        {
            vconcat:[
              {
                    width:mainWidth,
                    layer: [
                        { //Base scatter plot
                          selection: {
                            brushQQ: { type: "interval" }
                          },
                          mark: {type: "point", filled:true},
                          encoding: {
                            x: { field: xname, type: "quantitative", "scale": {"type": xScale}, axis: {title: xVar}},
                            y: { field: yname, type: "quantitative",  "scale": {"type": yScale}, axis: {title: yVar}},
                            size: {value: 100},
                            color: {
                                  condition: {
                                    test: "datum.context==false",
                                  },
                                  value: "gray"
                              },
                              opacity:{
                                condition:{
                                  selection: "brushQQ",
                                  value:.8
                                },
                                value: 0.3
                              }
                          }
                        },
                        { //Ensure that x Scale covers full domain (in case there is a y extension)
                            mark:"point",
                            encoding:{
                              x:{ field:xname, type:"quantitative","scale": {"type": xScale}},
                              opacity:{"value":0}
                            }
                        },
                        { //Ensure that y Scale covers full domain (in case there is an x extension)
                            mark:"point",
                            encoding:{
                              y:{
                                field:yname,
                                type:"quantitative",
                                "scale": {"type": yScale}
                              },
                              opacity:{"value":0}
                            }
                        },
                    ]
                }
            ]
        }
        ]
    }

    if(xBad){
      var extension = {
          vconcat:[
          {
              layer:[
                  {
                      selection: {
                          brushNN: {
                            type: "interval",
                          }
                      },
                      transform:[
                          {
                              filter: "(datum."+yname+"=='nan' || datum."+yname+"=='inf' || datum."+yname+" == '-inf')&&(datum."+xname+"=='nan' || datum."+xname+"=='inf' || datum."+xname+" == '-inf')"
                          }
                      ],
                      mark:{type:"point", filled:true},
                      encoding:{
                          x:{
                              field: xname,
                              type:"nominal",
                              axis:null
                          },
                          y:{
                             field: yname,
                              type:"nominal",
                              axis:null
                          },
                          size: {value: 100},
                          color: {
                                condition: {
                                  test: "datum.context==false",
                                },
                                value: "gray"
                            },
                            opacity:{
                              condition:{
                                selection: "brushNN",
                                value:.8
                              },
                              value: 0.3
                            }
                      }
                  },
                  {
                      transform:[
                          {
                              filter: "(datum."+xname+"=='nan' || datum."+xname+"=='inf' || datum."+xname+" == '-inf')"
                          }
                      ],
                      mark:"point",
                      encoding:{
                        x:{
                          field:xname,
                          type:"nominal"
                        },
                        opacity:{"value":0}
                      }
                  },
                  {
                      transform:[
                          {
                              filter: "(datum."+yname+"=='nan' || datum."+yname+"=='inf' || datum."+yname+" == '-inf')"
                          }
                      ],
                      mark:"point",
                      encoding:{
                        y:{
                          field:yname,
                          type:"nominal"
                        },
                        opacity:{"value":0}
                      }
                  }
              ]
          }
          ]
      }
      if (yBad){
        nnPlot =   {
                layer:[
                    {
                        selection: {
                            brushNQ: {
                              type: "interval",
                            }
                        },
                        transform:[
                            {
                                filter: "(datum."+xname+"=='nan' || datum."+xname+"=='inf' || datum."+xname+" == '-inf')"
                            }
                        ],
                        mark:{type:"point", filled:true},
                        encoding:{
                            x:{
                                field: xname,
                                type:"nominal",
                                axis:{title:null}
                            },
                            y:{
                               field: yname,
                                type:"quantitative",
                                "scale": {"type": yScale},
                                axis:null
                            },
                            size: {value: 100},
                            color: {
                                  condition: {
                                    test: "datum.context==false",
                                  },
                                  value: "gray"
                              },
                              opacity:{
                                condition:{
                                  selection: "brushNQ",
                                  value:.8
                                },
                                value: 0.3
                              }
                        }

                    },
                    {
                        transform:[
                            {
                                filter: "(datum."+xname+"=='nan' || datum."+xname+"=='inf' || datum."+xname+" == '-inf')"
                            }
                        ],
                        mark:"point",
                        encoding:{
                          x:{
                            field:xname,
                            type:"nominal"
                          },
                          opacity:{"value":0}
                        }
                    },
                    {
                        mark:"point",
                        encoding:{
                          y:{
                            field:yname,
                            type:"quantitative",
                            "scale": {"type": yScale}
                          },
                          opacity:{"value":0}
                        }
                    }
                ]
            }
        extension.vconcat.push(nnPlot)
      }

      spec.hconcat.push(extension)


    }

    if(yBad){
      var yExtension =   {
                width:mainWidth,
                layer:[
                    {
                    selection: {
                        brushQN: {
                          type: "interval",
                        }
                      },
                        transform:[
                        {
                            filter: "datum."+yname+"=='nan' || datum."+yname+"=='inf' || datum."+yname+" == '-inf'"
                        }
                        ],
                        mark:{type:"point", filled:true},
                        encoding:{
                            x:{
                                field: xname,
                                type:"quantitative",
                                scale:{"type":xScale},
                                axis:null
                            },
                            y:{
                               field: yname,
                                type:"nominal",
                                axis:{title:null}
                            },
                            size: {value: 100},
                            color: {
                                  condition: {
                                    test: "datum.context==false",
                                  },
                                  value: "gray"
                              },
                              opacity:{
                                condition:{
                                  selection: "brushQN",
                                  value:.8
                                },
                                value: 0.3
                              }
                        }
                    },
                    {
                        mark:"point",
                        encoding:{
                          x:{
                            field:xname,
                            type:"quantitative",
                            "scale": {"type": xScale}
                          },
                          opacity:{"value":0}
                        }
                    },
                    {
                        transform:[
                        {
                            filter: "datum."+yname+"=='nan' || datum."+yname+"=='inf' || datum."+yname+" == '-inf'"
                        }
                        ],
                        mark:"point",
                        encoding:{
                          y:{
                            field:yname,
                            type:"nominal"
                          },
                          opacity:{"value":0}
                        }
                    }
                ]
            }
      spec.hconcat[0].vconcat = [yExtension].concat(spec.hconcat[0].vconcat)
    }
    spec.hconcat[0].vconcat[0]["title"]= "Plot of " +xVar + " vs. " + yVar



    if(connect){

    }

    vegaEmbed('#plotView',spec,{
//    vegaEmbed(divName, spec, {
        patch: (spec) => {
          spec.signals.push({
              "name": "selectedPoints",
              "id": 0,
              "on": [{"events": "mousedown", "update": "datum"

              }]
          })

          return spec;
        }
      }).then(result => {
            vegaView = result.view;
//        	result.view.addSignalListener('brush1_x', brushed)
//        	result.view.addSignalListener('brush1_y', brushed)
        	result.view.addDataListener('brushQQ_store', function(d,e){
        	    brushed(d,e,"QQ")

        	})
            result.view.addDataListener('brushQN_store', function(d,e){
        	    brushed(d,e,"QN")
        	})
        	result.view.addDataListener('brushNQ_store', function(d,e){
        	    brushed(d,e,"QQ")

        	})
            result.view.addDataListener('brushNN_store', function(d,e){
        	    brushed(d,e,"QN")
        	})

//        	result.view.addSignalListener('brush_n_seqs', console.log)
//        	result.view.addSignalListener('brush_mean_mut_freq', console.log)
      	})
        .catch(console.warn);

    function brushed(d,e,types){
        var c = customX
        if (xVar=="timestamp"){
            c = customY
        }
        d3.selectAll("rect.execNode")
            .classed("highlighted",false)
            .style("fill",function(d){return get_fill_color(d,colorScale,c);})
            .style("stroke",function(d){return get_stroke_color(d,colorScale);});
        d3.selectAll("rect.contextNode")
            .classed("highlighted",false)
            .style("fill","gray")
            .style("stroke","black")


        QQbounds = null
        QNbounds = null
        NQbounds = null
        NNbounds = null

        if(vegaView.data("brushQQ_store").length > 0){
            QQbounds = vegaView.data("brushQQ_store")[0].values
        }
        if(yBad && vegaView.data("brushQN_store").length > 0){
            QNbounds = vegaView.data("brushQN_store")[0].values
        }
         if(xBad && vegaView.data("brushNQ_store").length > 0){
            NQbounds = vegaView.data("brushNQ_store")[0].values
        }
        if(xBad && yBad && vegaView.data("brushNN_store").length > 0){
            NNbounds = vegaView.data("brushNN_store")[0].values
        }

        selectedPoints = []

//        if(e.length>0){
//            bounds = e[0].values;
            allPts.forEach(function(d){
                x = getValue(d,xVar,xname,customX)
                y = getValue(d,yVar,yname,customY)
                var inBrush = false;

                if(QQbounds!=null){
                    if(QQbounds[0][0] <=x && x <=QQbounds[0][1] && QQbounds[1][0] >=y && y >=QQbounds[1][1] ){
                        inBrush = true;
                    }
                }
                if(QNbounds!=null  && !inBrush){
                    if(QNbounds[0][0] <=x && x <=QNbounds[0][1] && QNbounds[1].indexOf(y)>-1){
                        inBrush = true;
                    }
                }
                if(NQbounds!=null&& !inBrush){
                    if(NQbounds[1][0] >=y && y >=NQbounds[1][1] && NQbounds[0].indexOf(x)>-1){
                        inBrush = true;
                    }
                }
                if(NNbounds!=null && !inBrush){
                    if( NNbounds[1].indexOf(y)>-1 && NNbounds[0].indexOf(x)>-1){
                        inBrush = true;
                    }
                }

                if(inBrush){
                    selectedPoints.push(d)
                    var id = "#id"+d.id1;
                    d3.select(id)
                    .classed("highlighted",true)

                    d3.select("#context" + d.id1)
                    .classed("highlighted",true)

                    if ("id2" in d){
                         d3.select("#id"+d.id2)
                        .classed("highlighted",true)

                        d3.select("#context" + d.id2)
                        .classed("highlighted",true)
                    }
                }
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
