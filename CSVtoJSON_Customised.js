var readline = require('readline');
var fs = require('fs');



var yearOutput=fs.createWriteStream('yearWiseJSONCustom.json');
yearOutput.readable=true;
yearOutput.writable=true;

var countryOutput=fs.createWriteStream('countryWiseJSONCustom.json');
countryOutput.readable=true;
countryOutput.writable=true;


var rl = readline.createInterface({
  input: fs.createReadStream('indicators.csv')
});


var All_Asian_Countries = ["Afghanistan", "Bahrain", "Bangladesh", "Bhutan", "Myanmar", "Cambodia", "China", "India", "Indonesia", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Nepal",
"Oman", "Pakistan", "Philippines", "Qatar", "Saudi Arabia", "Singapore", "Sri Lanka", "Syrian Arab Republic", "Tajikistan", "Thailand", "Timor-Leste", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"];

var lineCounter=0;
var headerArray=[];

var genderArray=[];
var totalArray=[];
var countryIndex,indicatorIndex,yearIndex,valueIndex;
rl.on('line', function(line) {

	if(lineCounter==0){
		headerArray=line.split(",");
		countryNameIndex=headerArray.indexOf("CountryName");
		indicatorNameIndex=headerArray.indexOf("IndicatorName");
		yearIndex=headerArray.indexOf("Year");
		valueIndex=headerArray.indexOf("Value");

		console.log('headerArray is:'+ headerArray+"  "+countryNameIndex);

	++lineCounter;
	}else{
		var indLineArr=[];
		 var lineArr=line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
		 
		 lineArr.forEach(function(element){
		 	indLineArr.push(element.replace(/['"]+/g, ''));

		 });
		
		 //console.log('Line from file length:', indLineArr.length);
		
		/*Logic to handle the year wise data*/
		var female=0; var femaleCount=0; var male=0; var maleCount=0;
		var indicator=0;
		for(var x=0;x<All_Asian_Countries.length;x++){
			if(All_Asian_Countries[x]==indLineArr[countryNameIndex]){
				if(indLineArr[yearIndex]>1959 && indLineArr[yearIndex]<2016){
				  if(indLineArr[indicatorNameIndex]=='Life expectancy at birth, male (years)' || indLineArr[indicatorNameIndex]=='Life expectancy at birth, female (years)'){
					if(indLineArr[indicatorNameIndex]=='Life expectancy at birth, male (years)'){
						maleCount=maleCount+1;
						femaleCount=0;
						male=indLineArr[valueIndex];
						female=0;
					}

					if(indLineArr[indicatorNameIndex]=='Life expectancy at birth, female (years)'){
						femaleCount=femaleCount+1;
						maleCount=0;
						female=indLineArr[valueIndex];
						male=0;
					}

					for(var z=0;z<genderArray.length;z++){
						if(genderArray[z].year==indLineArr[yearIndex]){
							if(indLineArr[indicatorNameIndex]=='Life expectancy at birth, male (years)'){
								genderArray[z].male=parseFloat(genderArray[z].male)+parseFloat(indLineArr[valueIndex]);
								genderArray[z].maleCount=parseFloat(genderArray[z].maleCount)+1;
								indicator++;	
							}

							if(indLineArr[indicatorNameIndex]=='Life expectancy at birth, female (years)'){
								genderArray[z].female=parseFloat(genderArray[z].female)+parseFloat(indLineArr[valueIndex]);
								genderArray[z].femaleCount=parseFloat(genderArray[z].femaleCount)+1;
								indicator++;
							}

						}

					}
					if(indicator==0){
					//console.log('Line from file:', indLineArr[yearIndex]);
					genderArray.push({"year":parseFloat(indLineArr[yearIndex]),"female":female,"femaleCount":femaleCount,"male":male,"maleCount":maleCount});
					}
				  }

				}

			}

		}

		//console.log("start line",genderArray);

		
		//console.log("THE FINAL TOTAL COUNT %O",totalArray);
		var total=0; var totalCount=0;
		var totalIndicator =0;
		for(var x=0;x<All_Asian_Countries.length;x++){
			if(All_Asian_Countries[x]==indLineArr[countryNameIndex]){
				if(indLineArr[yearIndex]>1959 && indLineArr[yearIndex]<2016){
				  
					if(indLineArr[indicatorNameIndex]=='Life expectancy at birth, total (years)'){
						totalCount=totalCount+1;
						total=indLineArr[valueIndex];

						for(var z=0;z<totalArray.length;z++){
							if(totalArray[z].country==indLineArr[countryNameIndex]){
									totalArray[z].total=parseFloat(totalArray[z].total)+parseFloat(indLineArr[valueIndex]);
									totalArray[z].totalCount=parseFloat(totalArray[z].totalCount)+1;
									totalIndicator++;
							}

						}
						if(totalIndicator==0){
						totalArray.push({"country":indLineArr[countryNameIndex],"total":total,"totalCount":totalCount});
						}

				  	}

				}

			}

		}
		

	}//end of else

	
	//console.log('THE FINAL: %O', genderArray);
	//console.log("THE FINAL"+genderArray);
  
//lineArr=[];
		
}).on('close',function(){
	var finalGenderArray=[];
	var finalTotalArray=[];
	
	genderArray.sort(function(obj1, obj2) {
	// sort in descending order
	return obj1.year - obj2.year;
	});
	
	for(var zz=0;zz<genderArray.length;zz++){
		
		genderArray[zz].female=genderArray[zz].female/genderArray[zz].femaleCount;
		genderArray[zz].male=genderArray[zz].male/genderArray[zz].maleCount;

		finalGenderArray.push({"year":genderArray[zz].year,"female":genderArray[zz].female,"male":genderArray[zz].male});
	}
	
	yearOutput.write(JSON.stringify(finalGenderArray));

	for(var yy=0;yy<totalArray.length;yy++){

		totalArray[yy].total=totalArray[yy].total/totalArray[yy].totalCount;
		console.log('THEEEEEEE',totalArray[yy].total);
		finalTotalArray.push({"country":totalArray[yy].country,"total":totalArray[yy].total});
	}

	finalTotalArray.sort(function(obj1, obj2) {
	// sort in descending order
	return obj2.total - obj1.total;
	});
	var finalTopCountries=[];
	for(var i=0;i<5;i++)
	{
		finalTopCountries[i]=finalTotalArray[i];
	}
	 
	
	countryOutput.write(JSON.stringify(finalTopCountries));
 	
	//console.log('THE FINALMOSTTTTT: %O', finalGenderArray);


	console.log('THE ENDDDD: %O');

});//End of callback function


