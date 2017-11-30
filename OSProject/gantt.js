/**
 * @author Dimitry Kudrayvtsev
 * @version 2.0
 *
 * Ported to d3 v4 by Keyvan Fatehi on October 16th, 2016
 */

mainView = function() {
  	var FIT_TIME_DOMAIN_MODE = "fit";
  	var FIXED_TIME_DOMAIN_MODE = "fixed";

  	var margin = {
    	top : 20,
    	right : 20,
   	 	bottom : 20,
    	left : 40
  	};
  	var timeDomainStart = d3.timeDay.offset(new Date(),-3);
  	var timeDomainEnd = d3.timeHour.offset(new Date(),+3);
  	var timeDomainMode = FIXED_TIME_DOMAIN_MODE;// fixed or fit
  	var taskTypes = [];
  	var taskStatus = [];
  	var height = document.body.clientHeight - margin.top - margin.bottom-5;
  	var width = document.body.clientWidth - margin.right - margin.left-5;
  	var tickFormat = "%H:%M";

  	var keyFunction = function(d) {
    	return d.startDate + d.taskName + d.endDate;
  	};

  	var rectTransform = function(d) {
    	return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
  	};

  	var x,y,xAxis,yAxis;

  	initAxis();

  	var initTimeDomain = function() {
    	if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
      		if (tasks === undefined || tasks.length < 1) {
        		timeDomainStart = d3.timeDay.offset(new Date(), -3);
        		timeDomainEnd = d3.timeHour.offset(new Date(), +3);
        		return;
      		}	
      		tasks.sort(function(a, b) {
        		return a.endDate - b.endDate;
			});
			timeDomainEnd = tasks[tasks.length - 1].endDate;	
      		tasks.sort(function(a, b) {
        		return a.startDate - b.startDate;
      		});
      		timeDomainStart = tasks[0].startDate;
    	}
  	};

 	function initAxis() {
    	x = d3.scaleLinear().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

    	y = d3.scaleBand().domain(taskTypes).range([ 0, height - margin.top - margin.bottom ]).padding(0.1);

    	xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat(tickFormat))
      	.tickSize(8).tickPadding(8);
		var n = taskTypes.length;
		if(n>10){
			n=Math.floor(n/10)
		}
		else{
			n=1
		}
		
		var ticks = y.domain().filter(function(d,i){ return !(i%n); } );

    	yAxis = d3.axisLeft().scale(y).tickValues(ticks);
  	};

	//var yZoom = d3.zoom()
	//	.(y)
	//	.on("zoom",zoom())	
	
	
	mainView.nodeView=function(jobs,config,view){
		var colPadding = 10;
		var rowPadding = 10;
		var numRows = config.NumNodes/config.NodesPerSwitch
		//var size =Math.min((width-config.NodesPerSwitch*rowPadding)/config.NodesPerSwitch,(height-numRows*rowPadding)/numRows);
		var size =Math.min((width-(config.NodesPerSwitch+1)*rowPadding)/config.NodesPerSwitch,100);
		var fullHeight= (size+rowPadding)*numRows;
		d3.select("#"+view).selectAll(".chart").remove()
		var svg = d3.select("#"+view)
		.style("height",(height+margin.top+margin.bottom)+"px")
		.style("width",(width+margin.left+margin.right)+"px")
		.style("position","relative")
		.style("overflow-y","scroll")
		.style("overflow-x","hidden")
		.style("display","inline-block")
		.append("svg")
		.attr("class","nodeView")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", fullHeight + margin.top + margin.bottom)
		.attr("viewbox"," "+margin.left + " " +margin.top + "  "+height + " " + width)
    	.append("g")
    	.attr("class", "node-view")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", fullHeight + margin.top + margin.bottom)
  		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
		
		svg.append("rect")	
		.attr("width", width)
		.attr("height", fullHeight)
		.style("stroke","#000000")
		.style("fill","#EEEEEE")
		for(i=0; i < config.NumNodes; i++){
			svg.append("rect")
			.attr("width",size)
			.attr("height",size)
			.attr("class","node node"+i)
			.attr("transform","translate(" + ((i%config.NodesPerSwitch)*(size+rowPadding)+rowPadding) +"," + (Math.floor(i/config.NodesPerSwitch)*(size+rowPadding)+rowPadding)+")")
					
			svg.append("text")
			.attr("x",((i%config.NodesPerSwitch)*(size+rowPadding)+rowPadding)+size/2.0)
			.attr("y",(Math.floor(i/config.NodesPerSwitch)*(size+rowPadding)+rowPadding)+2.5*size/4.0)
			.style("font-size",(size/3.0) + "px")
			.style("text-anchor","middle")
			.text(i)
		}
			
	}
	
  	mainView.gantt=function(tasks,view) {

    	initTimeDomain();
    	initAxis();
		d3.select("#"+view).selectAll("*").remove()
   		var svg = d3.select("#"+view)
		.style("height",(height+margin.top+margin.bottom)+"px")
		.style("width",(width+margin.left+margin.right)+"px")
		.style("position","relative")
		.style("display","inline-block")
		.append("svg")
    	.attr("class", "chart")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("class", "gantt-chart")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
  		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
    
//  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

   	 	svg.selectAll(".chart")
    	.data(tasks, keyFunction).enter()
    	.append("rect")
    	.attr("rx", 5)
   		.attr("ry", 5)
  		.attr("class", function(d){ 
   			if(taskStatus[d.status] == null){ return "bar job" + d.status;}
    		return taskStatus[d.status] + " job" +d.status;
   		}) 
    	.attr("y", 0)
    	.attr("transform", rectTransform)
   		.attr("height", function(d) { return height/tasks.length; })
    	.attr("width", function(d) { 
     		return (x(d.endDate.getTime()) - x(d.startDate.getTime())); 
   		})
  		.on("mouseover",function(d){
			if(!d3.select(this).classed("selected")){
          		d3.select(this).classed("highlighted",true)
				d3.select("#row1").selectAll("rect.job"+d.status)
				.classed("highlighted",true)
         		//svg.selectAll("rect")
				//.classed("highlighted", function(g){ return d.status==g.status}) 
          		var svgCoords = [0,0]
          		var svgStr =d3.select(this).attr("transform")
          		svgStr = svgStr.replace("translate"," ");
          		svgStr = svgStr.trim();
          		svgStr = svgStr.replace("(","")
          		svgStr = svgStr.replace(")","")
          		svgCoords = svgStr.split(",")
         		var coordinates = [svgCoords[0], svgCoords[1]];
       
//          coordinates = d3.mouse(this);
//          alert(coordinates)
//          tooltip.style("left",d3.event.pageX+"px")
//          .style("top",d3.event.pageY+"px")
//          .style("display","inline-block")
//          .html("Job: " + d.status)
//          svg.append("rect").attr("id", "r" + d.status + "-" + d.taskName + "-"+d.startDate.getTime())  // Create an id for text so we can select it later for removing on mouseout
//              .attr("transform","translate("+(parseFloat(coordinates[0])+10)+","+(parseFloat(coordinates[1])+5)+")")
//          .style("fill","#FFFFFF")
//          .attr("width",50)
//          .attr("height",20)
          
          		svg.append("text")
          		.attr("id", "t" + d.status + "-" + d.taskName + "-"+d.startDate.getTime())
          		.attr("class","rectText")
          		.attr("transform","translate("+(parseFloat(coordinates[0])+15)+","+(parseFloat(coordinates[1])+20)+")")
          		.text(function() {
              		return "Job: " + d.status;  // Value of the text
           		});
			}
			createHist("view1");
			createHist("view2");
   		})
      	.on("mouseout",function(d){
          	if(!d3.select(this).classed("selected")){
	      		var id ="t" + d.status + "-" + d.taskName + "-"+d.startDate.getTime();  
	    		d3.selectAll("#"+id).remove();  // Remove text location
              	d3.select(this).classed("highlighted",false)
         		d3.select("#row1").selectAll("rect.job"+d.status)
				.classed("highlighted",false)
          				
			}
			createHist("view1");
			createHist("view2");
      	})
      	.on("click",function(d){
          	if(!d3.select(this).classed("selected")){
              	d3.select(this).classed("highlighted",true);
              	d3.select(this).classed("selected",true);
         		svg.selectAll("rect.job"+d.status)
				.classed("highlighted",true)
				.classed("selected",true);
				//.classed("highlighted", function(g){ return d.status==g.status}) 
				//.classed("selected", function(g){ return d.status==g.status}) 
			}
          	else{
             	var id ="t" + d.status + "-" + d.taskName + "-"+d.startDate.getTime();
              	d3.selectAll("#"+id).remove();  // Remove text location
              	d3.select(this).classed("highlighted",false);
          		d3.select(this).classed("selected",false);
         		svg.selectAll("rect.job"+d.status)
				.classed("highlighted",false)
				.classed("selected",false);
          	}
			createHist("view1");
			createHist("view2");
      	})
     	 svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
        .transition()
        .call(xAxis);

      	svg.append("g").attr("class", "y axis").transition().call(yAxis);
	//	svg.append("rect").attr("
        return mainView;

  	};

  	mainView.redraw = function(tasks) {
    	initTimeDomain();
    	initAxis();

    	var svg = d3.select("svg");
    	var ganttChartGroup = svg.select(".gantt-chart");
    	var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

    	rect.enter()
      	.insert("rect",":first-child")
      	.attr("rx", 5)
      	.attr("ry", 5)
      	.attr("class", function(d){ 
        	if(taskStatus[d.status] == null){ return "bar";}
        	return taskStatus[d.status];
      	}) 
      	.transition()
      	.attr("y", 0)
      	.attr("transform", rectTransform)
      	.attr("height", function(d) { return y.bandwidth(); })
      	.attr("width", function(d) { 
       		return (x(d.endDate) - x(d.startDate)); 
      	});

      	rect.merge(rect).transition()
      	.attr("transform", rectTransform)
	    .attr("height", function(d) { return y.bandwidth(); })
        .attr("width", function(d) { 
         	return (x(d.endDate) - x(d.startDate));
        });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

        return mainView;
  	};

  	mainView.margin = function(value) {
    	if (!arguments.length)
      		return margin;
   	 	margin = value;
        return mainView;
  	};

  	mainView.timeDomain = function(value) {
    	if (!arguments.length)
      		return [ timeDomainStart, timeDomainEnd ];
    	timeDomainStart = +value[0], timeDomainEnd = +value[1];
        return mainView;
  	};

    /**
  * @param {string}
  *                vale The value can be "fit" - the domain fits the data or
  *                "fixed" - fixed domain.
  */
  	mainView.timeDomainMode = function(value) {
    	if (!arguments.length)
      		return timeDomainMode;
    	timeDomainMode = value;
        return mainView;
  	};

  	mainView.taskTypes = function(value) {
    	if (!arguments.length)
      		return taskTypes;
    	taskTypes = value;
        return mainView;
  	};

  	mainView.taskStatus = function(value) {
    	if (!arguments.length)
      		return taskStatus;
    	taskStatus = value;
        return mainView;
  	};

  	mainView.width = function(value) {
    	if (!arguments.length)
      		return width-margin.right-margin.left;
    	width = +value-margin.right-margin.left;
        return mainView;
  	};

  	mainView.height = function(value) {
    	if (!arguments.length)
     	 	return height-margin.top-margin.bottom;
    	height = +value-margin.top-margin.bottom;
        return mainView;
  	};

  	mainView.tickFormat = function(value) {
    	if (!arguments.length)
      		return tickFormat;
    	tickFormat = value;
        return mainView;
  	};

   	return mainView;
};


