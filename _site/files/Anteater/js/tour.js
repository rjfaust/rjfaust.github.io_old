function beginTour(){


  var tour = new Tour({
    steps: [
      {
        element: "#code", // element selector to show the popover next to;
        title: "Welcome to Anteater!",
        content: "We're going give you a quick walkthrough of the tool."
      },
      {
        element: "#code", // element selector to show the popover next to;
        title: "Code View",
        content: "To the left is the code view.  This view shows you the source code of the loaded program. Functions without any tracked values are collapsed"

      },
      {
        element: "#execution", // element selector to show the popover next to;
        title: "Execution View",
        placement: "left",
        content: "This view shows you a plot of the execution tree.  Blocks are either functions, loops, or instances of tracked values."
      },
      {
        element:"#legendNav",
        title: "Execution View Legend",
        placement:"left",
        content:"This legend tells you what each color in the execution plot represents."

      },
      {
        element:".openLegBtn",
        title: "Execution View Legend",
        placement:"left",
        content:"You can click this to collapse or open the legend."
      },
      {
        element:"#plot",
        title:"Plot View",
        placement: "left",
        content: "This is the plot area where selected values will be plotted. Four types of plots are offered, depending on the type of data presented."
      },
      {
        element:"#icon-box",
        title:"Box Plot",
        placement: "top",
        content: "Box plots are available for numeric data that can be grouped by a structure in the program (i.e. a function call or loop)."
      },
      {
        element:"#icon-histogram",
        title:"Histogram/Bar Plot",
        placement: "top",
        content: "Histograms are avaialble for any numeric data.  This icon will also plot bar plots for string or binary data."

      },
      {
        element:"#icon-scatter",
        title:"Scatter Plot",
        placement: "top",
        content: "Scatter plots are available for any numeric data. If only a single variable/expression is plotted, the scatterplot will show that value over time.  If two variables/expressions are plotted, it will plot them against each other."

      },
      {
        element:"#icon-curve",
        title:"Connected Scatter Plot",
        placement: "top",
        content: "Similar to the scatter plot, this curve connects the points in order of occurence. In a plot of a single value over time, each point would connect to the one immediately to the right.  In a plot of two variables/expressions against each other, the points would not be connected in horizontal order."
      },
      {
        element:"#plot",
        title:"Plot View",
        placement: "left",
        content: "Now let's actually plot some data."
      },
      {
        element:"#code",
        title:"Adding Variables to Plots",
        placement: "left",
        content: "The variables and expressions highlighted in blue are the ones traced by the program. To add a variable to the plot, highlight it with your mouse, click and drag it over to the plot area, and drop it into the plot.  The plot area highlights to show you where you are able to drop it. You can drop it in the center of the plot which will add it to the next free axis or you can drop it on a specific axis."
      },
      {
        element:"#traces",
        title:"Select Program",
        placement: "left",
        content: "Each of these is a pre-loaded, pre-traced program that you can inspect. The default program is \"Gradient Descent\".  Clicking on one of these will switch to that program."
      },




  ]});




  tour.init()
tour.setCurrentStep(0);
  tour.start(true)
}
