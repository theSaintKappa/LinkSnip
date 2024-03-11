import JSConfetti from "js-confetti";
import "./style.css";
const jsConfetti = new JSConfetti();

const CUT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white"><path d="M256 192l-39.5-39.5c4.9-12.6 7.5-26.2 7.5-40.5C224 50.1 173.9 0 112 0S0 50.1 0 112s50.1 112 112 112c14.3 0 27.9-2.7 40.5-7.5L192 256l-39.5 39.5c-12.6-4.9-26.2-7.5-40.5-7.5C50.1 288 0 338.1 0 400s50.1 112 112 112s112-50.1 112-112c0-14.3-2.7-27.9-7.5-40.5L499.2 76.8c7.1-7.1 7.1-18.5 0-25.6c-28.3-28.3-74.1-28.3-102.4 0L256 192zm22.6 150.6L396.8 460.8c28.3 28.3 74.1 28.3 102.4 0c7.1-7.1 7.1-18.5 0-25.6L342.6 278.6l-64 64zM64 112a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm48 240a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></svg>`;

let displayedSnip = false;

const url = document.querySelector("[data-url]") as HTMLInputElement;
const cut = document.querySelector("[data-cut]") as HTMLElement;
cut.innerHTML = CUT_ICON;

async function generateSnip() {
    if (displayedSnip) {
        url.value = "";
        cut.innerHTML = CUT_ICON;
        displayedSnip = false;
        return;
    }

    if (url.value === "" || !/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(url.value)) {
        url.value = "Invalid URL";
        selectInput();
        shakeInput();
        return;
    }

    if (/(?:https?:\/\/)?link\.saintkappa\.dev\/?.*/.test(url.value)) {
        url.value = "You can't snip a snip!";
        selectInput();
        shakeInput();
        return;
    }

    cut.innerHTML = `<svg class="dots" width="36" height="10" viewBox="0 0 36 10" fill="#D9D9D9" xmlns="http://www.w3.org/2000/svg"><circle id="dot1" cx="5" cy="5" r="5" /><circle id="dot2" cx="18" cy="5" r="5" /><circle id="dot3" cx="31" cy="5" r="5" /></svg>`;
    const res = await fetch("https://link.saintkappa.dev/api/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.value }),
    });
    const snip = await res.json();

    url.value = snip.snipUrl;
    selectInput();
    navigator.clipboard.writeText(url.value);
    cut.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white"><path d="M243.8 339.8C232.9 350.7 215.1 350.7 204.2 339.8L140.2 275.8C129.3 264.9 129.3 247.1 140.2 236.2C151.1 225.3 168.9 225.3 179.8 236.2L224 280.4L332.2 172.2C343.1 161.3 360.9 161.3 371.8 172.2C382.7 183.1 382.7 200.9 371.8 211.8L243.8 339.8zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z" /></svg>`;
    jsConfetti.addConfetti();
    displayedSnip = true;
}

function selectInput() {
    url.select();
    url.setSelectionRange(0, 99999); // for mobile
}

const input = document.querySelector("[data-input]") as HTMLElement;
function shakeInput() {
    input.animate([{ transform: "translateX(0)" }, { transform: "translateX(10px)" }, { transform: "translateX(-10px)" }, { transform: "translateX(10px)" }, { transform: "translateX(-10px)" }, { transform: "translateX(0)" }], {
        duration: 400,
        easing: "linear",
    });
}

cut.onclick = async () => generateSnip();
url.onkeyup = (e) => {
    if (e.key !== "Enter") return;
    generateSnip();
};

url.oninput = () => {
    if (!displayedSnip) return;
    cut.innerHTML = CUT_ICON;
    displayedSnip = false;
};

// API Modal
const openModal = document.querySelector("[data-open-modal]") as HTMLElement;
const closeModal = document.querySelector("[data-close-modal]") as HTMLElement;
const modal = document.querySelector("[data-modal-wrapper]") as HTMLElement;
const apiVersion = document.querySelector("[data-api-version]") as HTMLElement;

let data: typeof import("../../package.json");
openModal.onclick = async () => {
    modal.style.display = "grid";
    modal.animate([{ opacity: "0" }, { opacity: "1" }], {
        duration: 250,
        easing: "ease",
    });

    apiVersion.textContent = `v${data.version}`;
};
closeModal.onclick = () => {
    modal.style.display = "none";
};

(async () => {
    const res = await fetch("https://raw.githubusercontent.com/theSaintKappa/LinkSnip/master/package.json");
    data = await res.json();
})();
