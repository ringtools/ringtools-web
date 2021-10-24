import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-rof-circle',
  templateUrl: './rof-circle.component.html',
  styleUrls: ['./rof-circle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RofCircleComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() ringName: string = '';

  hostElement: any; // Native element hosting the SVG container
  svg: any; // Top level SVG element
  g: any; // SVG Group element
  innerRadius!: number; // Inner radius of donut chart
  // Inner radius of donut chart
  radius!: number; // Outer radius of donut chart
  // Outer radius of donut chart
  slices!: any;
  // Donut chart slice elements
  labels!: any; // SVG data label elements
  // SVG data label elements
  totalLabel!: { text: (arg0: number) => void; }; // SVG label for total
  // SVG label for total
  rawData!: any[]; // Raw chart values array
  // Raw chart values array
  total!: number; // Total of chart values
  // Total of chart values
  colorScale!: any; // D3 color provider
  // D3 color provider
  pieData: any; // Arc segment parameters for current data set
  pieDataPrevious: any; // Arc segment parameters for previous data set - used for transitions
  colors = d3.scaleOrdinal(d3.schemeCategory10);
  pie = d3.pie()
    //    .startAngle(-90 * Math.PI / 180)
    //    .endAngle(-90 * Math.PI / 180 + 2 * Math.PI)
    .value((d: any) => d.value)
    .padAngle(.01)
    .sort(null);
  arc: any;

  constructor(
    private elRef: ElementRef
  ) {
    this.hostElement = this.elRef.nativeElement;
   }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.updateChart(changes.data.currentValue);
    }
  }

  private createChart(data: any[]) {
    this.processPieData(data);
    this.removeExistingChartFromParent();
    this.setChartDimensions();
    this.setColorScale();
    this.addGraphicsElement();
    this.setupArcGenerator();
    this.addSlicesToTheDonut();
    this.addLabelsToTheDonut();
    this.addCenterLabel();
    //    this.addDonutTotalLabel();
  }

  public updateChart(data: any[]) {
    if (!this.svg) {
      this.createChart(data);
      return;
    }

    this.processPieData(data, false);
//    this.addSlicesToTheDonut();
    this.updateState();
//    this.removeSlices();
 //   this.updateLabels();
  }

  private updateState() {
    this.g.selectAll('path')
      .data(this.pie(this.pieData))
      .style("opacity", (d) => {
//        console.log(d.data)
        if (!d.data.data.active)
          return 0.25;
        return 1;
        
      })
      .style("stroke-width", (d) => {
        //        console.log(d.data)
                if (!d.data.data.active)
                  return 1;
                return 0;
                
              });
  }

  private addCenterLabel() {
    this.g.append("text")
	   .attr("text-anchor", "middle")
		 .attr('font-size', '1.3rem')
		 .attr('dy', 10)
     .attr('fill', '#ffffff')
	   .text(this.ringName);
     
  }

  private processPieData(data: any, initial = true) {
    let size = (100 / data.length)

    let newData = data.map((val) => {
      val.value = size
      return val
    });

    this.rawData = data;

    // @ts-ignore
    this.pieData = this.pie(newData);
    if (initial) {
      this.pieDataPrevious = this.pieData;
    }
  }

  private setChartDimensions() {
    let viewBoxHeight = 430;
    let viewBoxWidth = 430;
    this.svg = d3.select(this.hostElement).append('svg').lower()
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight);
  }

  private addGraphicsElement() {
    this.g = this.svg.append("g")
      .attr("transform", "translate(215,215)");
  }

  private setColorScale() {
    this.colorScale = d3.scaleLinear()
      .domain([1, 3.5, 6])
      // @ts-ignore
      .range(["#2c7bb6", "#ffffbf", "#d7191c"])
      // @ts-ignore
      .interpolate(d3.interpolateHcl);
  }

  private setupArcGenerator() {
    this.innerRadius = 50;
    this.radius = 80;
    let width = 430
    this.arc = d3.arc()
      .innerRadius(width * 0.75 / 2)
      .outerRadius(width * 0.75 / 2 + 30);
  }

  private addSlicesToTheDonut() {
    this.slices = this.g.selectAll('allSlices')
      .data(this.pie(this.pieData))
      .enter()
      .append('path')
      .attr("class", "donutArcSlices")
      .attr('d', this.arc)
      .attr('fill', (datum: any, index: any) => {
        return this.colorScale(`${index}`);
      })
      .style('opacity', (datum: any, index: any) => {
        if (!datum.data.data.active)
          return 0.25;
        return 1;
      })
      .attr("stroke-width", (datum) => { 
        return Number(!datum.data.data.active) * 2
      })
      .attr("stroke", (datum) => { 
        return !datum.data.data.active ? "yellow" : 'yellow'
      })
  }

  private addLabelsToTheDonut() {
    let self = this;
    this.g
      .selectAll('.donutArcSlices')

      .each(function (datum: any, index: any) {
        //A regular expression that captures all in between the start of a string (denoted by ^) and a capital letter L
        //The letter L denotes the start of a line segment
        //The "all in between" is denoted by the .+? 
        //where the . is a regular expression for "match any single character except the newline character"
        //the + means "match the preceding expression 1 or more times" (thus any single character 1 or more times)
        //the ? has to be added to make sure that it stops at the first L it finds, not the last L 
        //It thus makes sure that the idea of ^.*L matches the fewest possible characters
        //For more information on regular expressions see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        let firstArcSection = /(^.+?)L/;

        // @ts-ignore
        let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
        newArc = newArc.replace(/,/g, " ");

        //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
        //flip the end and start position
        let cond = datum.endAngle > 90;
        //      console.log(datum.endAngle, cond, Number(cond), Number(cond) * Math.PI/180, datum.endAngle > 90 * Math.PI/180)
        if (datum.endAngle > 90 * Math.PI / 180 && datum.endAngle < 300 * Math.PI / 180) {
          var startLoc = /M(.*?)A/,		//Everything between the first capital M and first capital A
            middleLoc = /A(.*?)0 0 1/,	//Everything between the first capital A and 0 0 1
            endLoc = /0 0 1 (.*?)$/;	//Everything between the first 0 0 1 and the end of the string (denoted by $)
          //Flip the direction of the arc by switching the start en end point (and sweep flag)
          //of those elements that are below the horizontal line

          // @ts-ignore
          var newStart = endLoc.exec(newArc)[1];
          // @ts-ignore
          var newEnd = startLoc.exec(newArc)[1];
          // @ts-ignore
          var middleSec = middleLoc.exec(newArc)[1];

          //Build up the new arc notation, set the sweep-flag to 0
          newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
        }//if

        self.g.append("path")
          .attr("class", "hiddenDonutArcs")
          .attr("id", "donutArc" + index)
          .attr("d", newArc)
          .style("fill", "none");
      })

    this.labels = this.g
      .selectAll('.donutText')
      .data(this.pieData)
      .enter().append("text")
      .attr("class", "donutText")
      //Move the labels below the arcs for slices with an end angle > than 90 degrees
      .attr("dy", function (datum: any, i) {
        // if (d.endAngle < 240 && d.endAngle > 90)
        //   return (d.endAngle > 90 * Math.PI/180 ? 18 : -11); 
        // else
        let cond = (datum.endAngle > 90 * Math.PI / 180 && datum.endAngle < 300 * Math.PI / 180);
        return (cond ? 18 : -11);
      }
      )
      //.attr("dy", -13)
      .append("textPath")
      .attr("startOffset", "50%")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .attr("xlink:href", function (d, i) { return "#donutArc" + i; })
      .text(function (d) { return d.data.name; });
    // .enter()
    // .append('text')
    // .text(this.labelValueGetter)
    // .attr('transform', (datum: any, index: any) => {
    //   return 'translate(' + this.arc.centroid(datum) + ')';
    // })
    // .style('font-size', '8px')
    // .style('text-anchor', 'middle');

  }

  private removeExistingChartFromParent() {
    // !!!!Caution!!!
    // Make sure not to do;
    //     d3.select('svg').remove();
    // That will clear all other SVG elements in the DOM
    d3.select(this.hostElement).select('svg').remove();
  }
}
