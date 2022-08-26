const baseURL = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/";
let selectorIndicator;
let selectorTara;
let selectorAn;
let unit = [
    "precision=1&sex=T&age=Y1",
    "precision=1&sex=T&age=Y1",
    "&unit=CLV_PCH_PRE_HAB&na_item=B1GQ"
];
let ani = {
    0 : "2007",
    1 : "2008",
    2 : "2009",
    3 : "2010",
    4 : "2011",
    5 : "2012",
    6 : "2013",
    7 : "2014",
    8 : "2015",
    9 : "2016",
    10 : "2017",
    11 : "2018",
    12 : "2019",
    13 : "2020",
    14 : "2021"
}

let apiError = document.querySelector('.handlerEroriApi p');

//when changing the indicator, we record the value in the Indicator selector and add the corresponding unit
document.querySelector("#selectorIndicator").addEventListener("change", () => {
    if (document.querySelector("#selectorIndicator").value == "demo_pjan?") {
        selectorIndicator = document.querySelector("#selectorIndicator").value + unit[0];
        return selectorIndicator;
    }
    if (document.querySelector("#selectorIndicator").value == "demo_mlexpec?"){
        selectorIndicator = document.querySelector("#selectorIndicator").value + unit[1];
        return selectorIndicator;
    }
    if (document.querySelector("#selectorIndicator").value == "sdg_08_10?") {
        selectorIndicator = document.querySelector("#selectorIndicator").value + unit[2];
        return selectorIndicator;
    }
});

// when changing the country, we record the value in the Country selector
document.querySelector("#selectorTara").addEventListener("change", () => {
    selectorTara = document.querySelector("#selectorTara").value;
    return selectorTara;
});

// when changing the year, we record the value in the Year selector
document.querySelector("#selectorAn").addEventListener("change", () => {
    selectorAn = document.querySelector("#selectorAn").value;
    return selectorAn;
});


// when pressing the button, we run the apiCall() function that brings us the necessary data
document.querySelector("#submitGrafic").addEventListener("click", () => {
    getHistogramData();
});

// when pressing arataTabel, if the year is selected we draw a table
document.querySelector("#arataTabel").addEventListener("click", () => {
    if (selectorAn == undefined) {
        alert("Pentru a vizualiza tabel, selectati un an.");
        return;    
    }
    getTableData();
    // document.querySelector('.tabelDate').classList.add("active");
});

// when uploading the document, the data is automatically retrieved according to the link in apiCall()
// document.addEventListener('DOMContentLoaded', () => {

//     apiCall("https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_pjan?precision=1&sex=T&age=Y1");
// })

// apiCall() function for retrieving data from the API
const apiCall = async (apiURL) => {
    try {
        let response = await fetch (apiURL);
        return await response.json();
    } catch(error) {
        console.error(error);
    }
}

const getHistogramData = async () => {
    let data = await apiCall(baseURL + selectorIndicator + "&sinceTimePeriod=2005" + "&geo=" + selectorTara);

    if(data.error) {
        apiError.classList.add('active');
        return;
    }
    
    apiError.classList.remove('active');
    let dataValue = data.value;
    let valueAn = Object.values(dataValue);
    let keyAn = Object.keys(dataValue);
    arataHistograma(data);
}

// when pressing the "" button, we retrieve the data and dynamically create HTML elements and show them to the user
const arataHistograma = (data) => {
    // if we already have displayed data, we delete it
    if (document.querySelector('.containerHistograma')) {
        document.querySelector('.containerHistograma').parentNode.removeChild(document.querySelector('.containerHistograma'));
    }
    // creating dynamic HTML elements to show data to the user
    let containerHistograma = document.createElement("div");
    containerHistograma.classList.add("containerHistograma");
    let unitHistograma = document.createElement("span");
    unitHistograma.classList.add("unitHistograma");
    containerHistograma.appendChild(unitHistograma);
    document.body.appendChild(containerHistograma);
    // we go through the object and for each value we create an SVG element that indicates the value of the object
    for (const [key, value] of Object.entries(data.value)) {
        // compare the api object with the year object and for each common key return the year value
        const comparaObiecte = (tooltip) => {
            for (const [aniKey, aniValue] of Object.entries(ani)) {
                if (`${key}` == `${aniKey}`) {
                    tooltip.innerText += " An: " + `${aniValue}`;
                }
            }
        }
        let histogramaContainer = document.createElement("div");
        histogramaContainer.classList.add("histogramaContainer");
        let newSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        newSVG.classList.add("newSVG");
        newSVG.setAttribute('width','20');

        if (`${value}` < 0) {
            document.querySelector("#valoareSubZero").innerText = "Valorile sub 1 nu se vor printa";
            continue;
        }

        if (`${value}` > 0) {
            newSVG.setAttribute('height',`${value}`);            
        }

        if (`${value}` > 100) {
            let numarPopulatie = `${value}`;
            let numarPopulatieFormat = Math.floor(numarPopulatie/1000);
            newSVG.setAttribute('height',numarPopulatieFormat);
            containerHistograma.style.height = "100%";
        }

        if (`${value}` > 0) {
            let svgPath = document.createElementNS("http://www.w3.org/2000/svg", "line");
            svgPath.setAttribute("stroke", "red");
            svgPath.setAttribute("stroke-width", 30);
            svgPath.setAttribute('id','line2');
            svgPath.setAttribute('x1','0');
            svgPath.setAttribute('y1','0');
            svgPath.setAttribute('x2','0');
            unitHistograma.innerText = "Ani";
            svgPath.setAttribute('y2',`${value}`);
            newSVG.appendChild(svgPath);
            let tooltip = document.createElement("span");
            tooltip.classList.add("tooltiptext");
            tooltip.innerText = `${value}` + "\n";
            comparaObiecte(tooltip);
            
            if (`${value}` <= 10) {
                let percentValue = Math.round(`${value}`) * 10;
                svgPath.setAttribute('y2',percentValue);
                tooltip.innerText = percentValue + "%";
                comparaObiecte(tooltip);
                newSVG.setAttribute('height',percentValue);
                unitHistograma.innerText = "%";
            }

            if (`${value}` > 100) {
                let numarPopulatie = `${value}`;
                let numarPopulatieFormat = Math.floor(numarPopulatie/1000);
                tooltip.innerText = numarPopulatieFormat + "K";
                comparaObiecte(tooltip);
                unitHistograma.innerText = "Numar";
                svgPath.setAttribute('y2',numarPopulatieFormat);
            }
            histogramaContainer.appendChild(tooltip);
            histogramaContainer.appendChild(newSVG);
            document.querySelector(".containerHistograma").appendChild(histogramaContainer);
        }

    }  
}
// demo_pjan?, demo_mlexpec?, sdg_08_10?
const getTableData = async () => {
    // an empty array in which we will put all 3 objects from the API
    let dateEurostat = [];
    let dataPopulatie = await apiCall(baseURL + "demo_pjan?precision=1&sex=T&age=Y1" + "&time=" + selectorAn + "&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE");
    let dataSperantaViata = await apiCall(baseURL + "demo_mlexpec?precision=1&sex=T&age=Y1" + "&time=" + selectorAn + "&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE");
    let dataGDP = await apiCall(baseURL + "sdg_08_10?&unit=CLV_PCH_PRE_HAB&na_item=B1GQ" + "&time=" + selectorAn + "&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE");
    // populating the Eurostat data array with the 3 objects from the API
    dateEurostat.push(dataPopulatie);
    dateEurostat.push(dataSperantaViata);
    dateEurostat.push(dataGDP);
    // drawing and populating the table
    populeazaTabel(dateEurostat);
}

const populeazaTabel = (dateEurostat) => {
    console.log(dateEurostat);
    // if we have no data in the array, we stop
    if(dateEurostat.length == 0) return;

    // drawing and populating the table
    let containerTabel = document.querySelector('.containerTabel');
    let tabel = ``;
    tabel += `<table class="tabelDate">`
        tabel += `<thead>`;
            tabel += `<tr>`;
                tabel += `<th>Tara</th>`;
                dateEurostat.map(item => {
                    const { label } = item;
                    tabel += `<th>${label}</th>`;
                });
            tabel += `</tr>`;
        tabel += `</thead>`;
        tabel += `<tbody>`;
            const { dimension : { geo : { category : { label : numeTara } } }, value : valoriPopulatie } =  dateEurostat[0];
            const { value : valoriSperantaViata } =  dateEurostat[1];
            const { value : valoriGDP } =  dateEurostat[2];
            index = 0;
            for (const [key, value] of Object.entries(numeTara)) {
                tabel += `<tr>`;
                    tabel += `<td>${value}</td>`;
                    tabel += `<td>${valoriPopulatie[index]}</td>`;
                    tabel += `<td>${valoriSperantaViata[index]}</td>`;
                    tabel += `<td>${valoriGDP[index]}</td>`;
                tabel += `</tr>`;
                index++;
            };
        tabel += `</tbody>`;
    tabel += `</table>`;

    // adding the table to the DOM
    let tabelHtml = new DOMParser().parseFromString(tabel, "text/html");
    tabelHtml = tabelHtml.getRootNode();
    containerTabel.innerHTML = "";
    containerTabel.append(tabelHtml.body);
}
