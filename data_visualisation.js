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


// la apasarea butonului, rulam functia getData() care ne aduce datele necesare
document.querySelector("#submitGrafic").addEventListener("click", () => {
    const baseURL = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/";

    // linkul final pe care il pasam in getData()
    const requestURL = baseURL + selectorIndicator + "&sinceTimePeriod=2005" + "&geo=" + selectorTara;
    getData(requestURL);
});


// la incarcarea documentului, datele se preiau automat conform linkului din getData()
// document.addEventListener('DOMContentLoaded', () => {

//     getData("https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_pjan?precision=1&sex=T&age=Y1");
// })

// functia getData() pentru preluarea datelor de la API
const getData = async (apiURL) => {
    const response = await fetch (apiURL);
    const data = await response.json();
    showData(data);
    arataHistograma(data);
    // daca avem eroare, vom alerta utilizatorul
    if (data.error) {
        alert("Eroare neasteptata. Va rugam selectati o valoare sau incercati mai tarziu.");
    }
}

const showData = (data) => {
    let dataValue = data.value;
    let valueAn = Object.values(dataValue);
    let keyAn = Object.keys(dataValue);
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


