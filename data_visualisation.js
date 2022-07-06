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

// la schimbarea indicatorului, inregistram valoarea in selectorIndicator si adaugam unitul corespunzator
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

// la schimbarea tarii, inregistram valoarea in selectorTara
document.querySelector("#selectorTara").addEventListener("change", () => {
    selectorTara = document.querySelector("#selectorTara").value;
    return selectorTara;
});

// la schimbarea anului, inregistram valoarea in selectorAn
document.querySelector("#selectorAn").addEventListener("change", () => {
    selectorAn = document.querySelector("#selectorAn").value;
    return selectorAn;
});


// la apasarea butonului, rulam functia apiCall() care ne aduce datele necesare
document.querySelector("#submitGrafic").addEventListener("click", () => {
    getHistogramData();
});

// la apasare arataTabel, daca anul e selectat desenam tabel
document.querySelector("#arataTabel").addEventListener("click", () => {
    if (selectorAn == undefined) {
        alert("Pentru a vizualiza tabel, selectati un an.");
        return;    
    }
    getTableData();
    // document.querySelector('.tabelDate').classList.add("active");
});

// la incarcarea documentului, datele se preiau automat conform linkului din apiCall()
// document.addEventListener('DOMContentLoaded', () => {

//     apiCall("https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_pjan?precision=1&sex=T&age=Y1");
// })

// functia apiCall() pentru preluarea datelor de la API
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

// la apasarea butonului "" preluam datele si creand dinamic elemente HTML le aratam utilizatorului
const arataHistograma = (data) => {
    // daca deja avem date afisate le stergem
    if (document.querySelector('.containerHistograma')) {
        document.querySelector('.containerHistograma').parentNode.removeChild(document.querySelector('.containerHistograma'));
    }
    // cream elemente HTML dinamic pentru a arata datele utilizatorului
    let containerHistograma = document.createElement("div");
    containerHistograma.classList.add("containerHistograma");
    let unitHistograma = document.createElement("span");
    unitHistograma.classList.add("unitHistograma");
    containerHistograma.appendChild(unitHistograma);
    document.body.appendChild(containerHistograma);
    // parcurgem obiectul si pentru fiecare valoare cream un SVG element care indica valoarea obiectului
    for (const [key, value] of Object.entries(data.value)) {
        // compara obiectul de la api cu obiectul ani si pentru fiecare cheie comuna intoarce valoarea anului
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
    // Un array gol in care vom pune toate cele 3 obiecte venite de la API
    let dateEurostat = [];
    let dataPopulatie = await apiCall(baseURL + "demo_pjan?precision=1&sex=T&age=Y1" + "&time=" + selectorAn + "&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE");
    let dataSperantaViata = await apiCall(baseURL + "demo_mlexpec?precision=1&sex=T&age=Y1" + "&time=" + selectorAn + "&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE");
    let dataGDP = await apiCall(baseURL + "sdg_08_10?&unit=CLV_PCH_PRE_HAB&na_item=B1GQ" + "&time=" + selectorAn + "&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE");
    // Populam array dateEurostat cu cele 3 obiecte de la API
    dateEurostat.push(dataPopulatie);
    dateEurostat.push(dataSperantaViata);
    dateEurostat.push(dataGDP);
    // Desenam si populam tabelul
    populeazaTabel(dateEurostat);
}

const populeazaTabel = (dateEurostat) => {
    console.log(dateEurostat);
    // Daca nu avem date in array ne oprim
    if(dateEurostat.length == 0) return;

    //Desenam si populam tabelul
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

    // Adaugam tabelul in DOM
    let tabelHtml = new DOMParser().parseFromString(tabel, "text/html");
    tabelHtml = tabelHtml.getRootNode();
    containerTabel.innerHTML = "";
    containerTabel.append(tabelHtml.body);
}
