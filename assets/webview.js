
/**
 * @type {Window}
 */
const vscode = acquireVsCodeApi();
function bindLinks() {
    window.document.body.addEventListener('click', ($event) => {
        
        /** @type {HTMLAnchorElement} */
        let target = getTargetAnchorElement($event.target);
        if(target && target.tagName === "a") {
            $event.preventDefault();
            vscode.postMessage({
                command: "vscode.open",
                uri: target.href.baseVal || target.href
            });
        }
    });
}

function bindZoomSlider() {
    /** @type {HTMLDivElement} */
    const diagram = window.diagram;

    window.zoomslider.addEventListener('input', () => { 
        diagram.style.zoom = window.zoomslider.value / 100;
    });
}

function getTargetAnchorElement(/** @type {HTMLElement} */ elem) {
    if(elem) {
        if(elem.tagName === "a") {
            return elem;
        }
        return getTargetAnchorElement(elem.parentElement);
    }   
}


document.addEventListener("DOMContentLoaded", () => {
    bindLinks();
    bindZoomSlider();
});
