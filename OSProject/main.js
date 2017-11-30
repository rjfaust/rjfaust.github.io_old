var svgWidth = 1000,
schedData = {},
schedData2 = [],
timeSpan ={},
origTimeSpans = {},
config =[],
x = d3.scaleLinear(),
y = d3.scaleLinear(),
jobIDs=[],
jobs = {},
origJobs = {}
nodes = [],
binWidth=10,
numBins= 100,
binnedData =[],
maxNodes = 0,
config = {},
view = 0;
viewWidths={},
viewHeights={},
listWidth =200,
listHeight = 0,
screenHeight=0,
screenWidth=0,
histHeight = 100,
sliderHeight = 20,
buttonHeight=0,
sliderTicks ={},
handlePos = {};


var jobStatuses = {}
jobs["view1"] = []
jobs["view2"] = []
timeSpan["view1"]=[0,0]
timeSpan["view2"]=[0,0]
schedData["view1"]=[];
schedData["view2"]=[];
viewWidths["view1"]=0;
viewWidths["view2"] = 0;
viewHeights["view1"] = 0;
viewHeights["view2"]=0;



btns = d3.select("#buttons");
btns.append("label")
.html("Select Schedule File")

btns.append("input")
.attr("type", "file")
.attr("id","datFile")
.attr("accept", ".csv")
.style("margin", "5px")
.on("change", function() {
    var file = d3.event.target.files[0];
    if (file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
    var dataUrl = evt.target.result;
    // The following call results in an "Access denied" error in IE.
    loadSchedule(dataUrl,"view1");
    };
    reader.readAsDataURL(file);
    }
    })

btns.append("label")
.html("Set Node Configuration")
btns.append("input")
.attr("type", "file")
.attr("id","configFile")
.attr("accept", ".csv")
.style("margin", "5px")
.on("change", function() {
    var file = d3.event.target.files[0];
    if (file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
    var dataUrl = evt.target.result;
    loadConfig(dataUrl);
	// The following call results in an "Access denied" error in IE.
    };
    reader.readAsDataURL(file);	
	}
    })

btns.append("label")
.html("Select Second Schedule File")

btns.append("input")
.attr("type", "file")
.attr("id","datFile")
.attr("accept", ".csv")
.style("margin", "5px")
.on("change", function() {
    var file = d3.event.target.files[0];
    if (file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
    var dataUrl = evt.target.result;
    // The following call results in an "Access denied" error in IE.
    loadSchedule(dataUrl,"view2");
    };
    reader.readAsDataURL(file);
    }
    })

btns.append("input")
.attr("type","button")
.attr("id","btn_switchView")
.attr("value","Switch Views")
.on("click",function(){
	view = 1-view;
	createVis();
});


function loadConfig(csvUrl){
	
	d3.csv(csvUrl, function(error, data) {
           if (error) throw error;
				config = data;
				config = config[0];
				config.NodesPerSwitch = parseInt(config.NodesPerSwitch);
				config.NumNodes = parseInt(config.NumNodes);
				maxNodes =parseInt(config.NumNodes,10); 
	 })

}

function intSort(a,b){
	return (a-b);
}
function jobSort(a,b){
	return parseInt(a.JobID)-parseInt(b.JobID);

}

function loadSchedule(csvUrl,view){
	screenHeight = document.body.clientHeight-100;
	screenWidth= document.body.clientWidth-100;	
	buttonHeight = d3.select("#buttons").node().offsetHeight;
	d3.csv(csvUrl, function(error, data) {
    	if (error) throw error;
		schedData[view] = []
		jobs[view] = []
		nodes = []
		schedData[view] = data
		schedData[view].forEach(function(job){
          	job.StartTime = parseFloat(job.StartTime);
            job.EndTime = parseFloat(job.EndTime);
	     	job.JobID = job.JobID.trim()	
            var usedNodes =job.NodesUsed.trim().split(" ");
            job.NodesUsed = usedNodes    
            jobStatuses[job.JobID] = "bar";
			usedNodes.forEach(function(n){
                jobs[view].push({"startDate":new Date(job.StartTime),"endDate":new Date(job.EndTime),"taskName": n,"status":job.JobID})
                     if(nodes.indexOf(parseInt(n))<0){
                          nodes.push(parseInt(n));
                      }
               })
			//console.log(JSON.stringify(job))		
		})
       	nodes.sort(intSort)
		schedData[view].sort(jobSort)
		if(!config.NumNodes){
			maxNodes = nodes.length
		}
       	timeSpan[view] = d3.extent(schedData[view],function(d){return d["StartTime"]});
       	var endSpan = d3.extent(schedData[view],function(d){return d["EndTime"]});
       	timeSpan[view][1] = parseFloat(endSpan[1]);
       	timeSpan[view][0] = parseFloat(timeSpan[view][0]);
		//console.log(JSON.stringify(schedData));
		origTimeSpans[view] = timeSpan[view];		 
		sliderTicks[view] = []
		sliderTicks[view].push(timeSpan[view][0])
		sliderTicks[view].push(timeSpan[view][1])
		handlePos[view]=[]
		handlePos[view].push(timeSpan[view][0])
		handlePos[view].push(timeSpan[view][1])
 		createVis(false);
    })
}

function createVis(update){
    
    d3.select("#view1").selectAll("*").remove()
    d3.select("#list").selectAll("*").remove()
    d3.select("#view2").selectAll("*").remove()
    d3.select("#histview1").selectAll("*").remove()
    d3.select("#histview2").selectAll("*").remove()
	var height = 450;
	var viewWidth = 500;
    var format = "%L";
//	mv.nodeView(config	)
    var jobList = d3.select("#list")
	.style("height",height+"px")
	.style("position","relative")
	.style("width", listWidth + "px")
	.style("display","inline-block")
	.style("vertical-align","top")
	.append("select")
    .attr("id","listBox")
	.attr("multiple",true)
//    .attr("height",450)
//    .attr("width",300)
    .attr("size",20)
    .style("background-color","#EEEEEE")
    .style("border-color","#000000")

	dataToUse = schedData["view1"]
	if(schedData["view1"].length==0){
		dataToUse = schedData["view2"]
	}	    
	var menu = contextMenu().items('Set Color','Remove Color');
    jobList.selectAll(".listItem").data(dataToUse)
    .enter()
    .append("option")
    .html(function(d){ return "Job: "+d.JobID+"\tStart: "+d.StartTime+"\tRun Time: " + (d.EndTime-d.StartTime)})
    .on("click",function(d){
        item = d3.select(this)
		currSelection = jobList.selectAll("option").filter(function(d,i){return this.selected}).data().map(a=>a.JobID)
	 	if(view==0){
					d3.select("#row1").selectAll("rect.bar")
            		.classed("highlighted",function(g){return currSelection.indexOf(g.status)>=0;})
        			.classed("selected",function(g){return currSelection.indexOf(g.status)>=0})
					if(d3.event.shiftKey){
						d3.selectAll("#row1").selectAll("rect.bar").classed("highlighted",function(g){return currSelection.indexOf(g.status)>=0})
						d3.selectAll("#row1").selectAll("rect.bar").classed("selected",function(g){return currSelection.indexOf(g.status)>=0})
					}
					//this.selected = false
					createHist("view1")
					createHist("view2")
		}
        })
	/*.on("contextmenu",function(d){
		d3.event.preventDefault();
		menu(d3.mouse(this)[0],d3.mouse(this)[1])

	})*/
   	listWidth = jobList.node().offsetWidth;
	jobList.attr("width",listWidth);
	d3.select("#histSpace")
	.style("height",histHeight+"px")
	.style("position","relative")
	.style("width", listWidth + "px")
	.style("display","inline-block")
	var mv = mainView().height(height).width(viewWidth).taskTypes(nodes).taskStatus(jobStatuses).tickFormat(format);
   	mv.timeDomain(timeSpan["view1"]);
	
	if(jobs["view1"].length>0){
		if(viewWidths["view2"]>0){
			viewWidths["view1"] = (screenWidth-listWidth)/2.0;
			viewWidths["view2"]=viewWidths["view1"];
		}
		else{
			viewWidths["view1"] = screenWidth-listWidth;
		}
		viewHeights["view1"] = screenHeight-sliderHeight-histHeight-buttonHeight;
	}
	if(jobs["view2"].length>0){
		if(viewWidths["view1"]>0){
			viewWidths["view2"] = (screenWidth-listWidth)/2.0;
			viewWidths["view1"]=viewWidths["view2"];
		}
		else{
			viewWidths["view2"] = screenWidth-listWidth;
		}
		viewHeights["view2"] = screenHeight-sliderHeight-histHeight-buttonHeight;
	}
	if(view==0){
		if(jobs["view1"].length>0){
    		mv.height(viewHeights["view1"]).width(viewWidths["view1"]).taskTypes(nodes).taskStatus(jobStatuses).tickFormat(format);
    		mv.timeDomain(timeSpan["view1"]);
   			mv.gantt(jobs["view1"],"view1");
		}
		if(jobs["view2"].length>0){
    		mv.height(viewHeights["view2"]).width(viewWidths["view2"]).taskTypes(nodes).taskStatus(jobStatuses).tickFormat(format);
    		mv.timeDomain(timeSpan["view2"]);
   			mv.gantt(jobs["view2"],"view2");
		}
	}
	else{
		if(jobs["view1"].length>0){
    		mv.height(viewHeights["view1"]).width(viewWidths["view1"]).taskTypes(nodes).taskStatus(jobStatuses).tickFormat(format);
    		mv.timeDomain(timeSpan["view1"]);
			mv.nodeView(jobs["view1"],config,"view1")
		}
		if(jobs["view2"].length>0){
    		mv.height(viewHeights["view2"]).width(viewWidths["view2"]).taskTypes(nodes).taskStatus(jobStatuses).tickFormat(format);
    		mv.timeDomain(timeSpan["view2"]);
			mv.nodeView(jobs["view2"],config,"view2")
		}
	}
	if(jobs["view1"].length>0){
	    createHist("view1");
			createSlider("view1");
	}

	if(jobs["view2"].length>0){
		createHist("view2")
			createSlider("view2");
	}
}

function createSlider(viewNum){
	var svg = d3.select("#"+viewNum).append("svg")
	.attr("height",20)
	.attr("width",viewWidths[viewNum])
	margin = {right: 10, left: 10},
   	width = viewWidths[viewNum]- margin.left - margin.right,
   	height = 20;

	var slideX = d3.scaleLinear()
   	.domain(origTimeSpans[viewNum])
   	.range([0, width])
   	.clamp(true);
	var slider = svg.append("g")
   	.attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

	slider.append("line")
    .attr("class", "track")
    .attr("x1", slideX.range()[0])
    .attr("x2", slideX.range()[1])
  	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	
	slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  	.selectAll("text")
  	.data(sliderTicks[viewNum])
  	.enter().append("text")
    .attr("x", function(d){return slideX(d);})
    .attr("text-anchor", "middle")
    .text(function(d) { return parseInt(d*100)/100.0; });

	var handleL = slider.insert("circle", ".track-overlay")
    .attr("class", "handleL")
	.attr("r",9)
	.attr("cy",0)
	.attr("cx",slideX(handlePos[viewNum][0]))
	.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
	var handleR = slider.insert("circle", ".track-overlay")
    .attr("class", "handleR")
    .attr("r", 9)
	.attr("cy",0)
	.attr("cx",slideX(handlePos[viewNum][1]))
	.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
	function dragstarted(d) {
  		console.log("Start: " + d3.event.x)
		d3.select(this).raise().classed("active", true);
	}

	function dragged(d) {
  		d3.select(this).attr("cx", function(){
			var newX = d3.event.x;
			if(newX>width){
				newX
			}
			var coords = d3.mouse(this);
			var tempX = d3.select("#"+viewNum).select(".slider").node().getBoundingClientRect();
			console.log(JSON.stringify(coords))
			console.log(JSON.stringify(tempX));
			console.log(newX);
			newX = coords[0]-tempX.x
			if(newX>slideX.range()[1]){
				newX = slideX.range()[1];
			}
			else if(newX<slideX.range()[0]){
				newX = slideX.range()[0];
			}
				
			if(d3.select(this).classed("handleR") && newX<(parseInt(handleL.attr("cx")))){
				newX = handleL.attr("cx");
			}
			else if(d3.select(this).classed("handleL") && newX >handleR.attr("cx")){
				newX = handleR.attr("cx");
			}
			//console.log(handleL.attr("cx")+ ", "+handleR.attr("cx"))		
			updateTimeSlice(slideX.invert(handleL.attr("cx")),slideX.invert(handleR.attr("cx")))
			return newX;
				
		})
	}

	function dragended(d) {
  		d3.select(this).classed("active", false);
	}

	function updateTimeSlice(low,high){
		//console.log(low + ", " +high)
		sliderTicks[viewNum] =[]
		sliderTicks[viewNum].push(origTimeSpans[viewNum][0]);
		sliderTicks[viewNum].push(origTimeSpans[viewNum][1]);
		handlePos[viewNum][0] = low;
		handlePos[viewNum][1] =high;
		if(low>origTimeSpans[viewNum][0]){
			sliderTicks[viewNum].push(low)
		}
		if(high<origTimeSpans[viewNum][1]){
			sliderTicks[viewNum].push(high)
		}
		timeSpan[viewNum] =[low,high]
  		d3.select("#"+viewNum).select("g.slider").select("g.ticks")	
  		.selectAll("*").remove()

		d3.select("#"+viewNum).select("g.slider").select("g.ticks")	
		.attr("transform", "translate(0," + 18 + ")")
  		.selectAll("text")
  		.data(sliderTicks[viewNum])
  		.enter().append("text")
    	.attr("x", function(d){return slideX(d);})
    	.attr("text-anchor", "middle")
    	.text(function(d) { return parseInt(d*100)/100.0; });
		
		createVis(true)	
			
	}
}


function createHist(chartView,update){
	var margin={
		left: 40,
		right:20
	}
	if(jobs[chartView].length==0){
		return;
	}
	var timeScale = d3.scaleLinear()
    .domain([0,numBins])
    .range(timeSpan[chartView])
    
    var x  = d3.scaleLinear()
    .domain([timeSpan[chartView][0],timeSpan[chartView][1]])
    .range([0,viewWidths[chartView]])

    var y = d3.scaleLinear()
    .range([histHeight,0])
    y.domain([0, maxNodes]);
	
    binWidth = (timeSpan[chartView][1]-timeSpan[chartView][0])/parseFloat(numBins)
	var binnedSelection = [];
    if(!update){
		binnedData = [];	
    	for(i = 0; i < numBins; i++){
        	binnedData.push(0);
    		binnedSelection.push(0);
			}
    	schedData[chartView].forEach(function(d){
                  var i = Math.floor((parseFloat(d.StartTime)-timeSpan[chartView][0])/binWidth);
                  var maxI = Math.ceil((parseFloat(d.EndTime)-timeSpan[chartView][0])/binWidth);
					if(maxI>numBins){
						maxI = numBins
					}
					for(i; i <maxI;i+=1 ){
                       binnedData[i]+=d.NodesUsed.length
                   }
                   })
 	}
	else{
		for(i = 0; i < numBins; i++){
    		binnedSelection.push(0);
		}
	}
	if(view==0){
 	var selectedData = d3.select("#"+chartView).selectAll("rect.highlighted")
	.data()
	
	selectedData.forEach(function(d){
		var i = Math.floor((d.startDate.getTime()-timeSpan[chartView][0])/binWidth);
        var maxI = Math.ceil((d.endDate.getTime()-timeSpan[chartView][0])/binWidth);
        if(maxI>numBins){
			maxI = numBins;
		}
		for(i; i <maxI;i+=1 ){
			binnedSelection[i]+=1
      	}
	});	
	}
	else{
		//Check list of jobs for selection
		//Check nodes for selection
		
		

	}
	//console.log(JSON.stringify(selectedData))	   
	d3.select("#hist"+chartView).selectAll("*").remove()
    d3.select("#hist"+chartView)
    .style("position","relative")
	.style("display","inline-block")
	.append("svg")
	.attr("width",viewWidths[chartView])
    .attr("height",histHeight)
    .selectAll("rect")
    .data(binnedData)
    .enter().append("rect")
    .attr("class", "histBar")
    .attr("x", 1)
    .attr("transform", function(d,i) {
          return "translate(" + x(timeScale(i)) + "," + y(d) + ")"; })
    .attr("width", parseFloat(viewWidths[chartView])/numBins+.01)
    .attr("height", function(d,i) {
		if(isNaN(d)){
			console.log(i)
		}
	if(timeScale(i)>=timeSpan[chartView][0] && timeScale(i)<=timeSpan[chartView][1]){return histHeight - y(d);}else{return 0;} });
	
	d3.select("#hist"+chartView).select("svg")
	.attr("width",viewWidths[chartView])
	.attr("height",histHeight)
	.selectAll("rect.histBarOverlay")
	.data(binnedSelection)
	.enter().append("rect")
	.attr("class", "histBarOverlay")
	.attr("x", 1)
	.attr("transform", function(d,i) {
		  return "translate(" + x(timeScale(i)) + "," + y(d) + ")"; })
	.attr("width", parseFloat(viewWidths[chartView])/numBins)
	.attr("height", function(d) { return histHeight - y(d); });
    

}
