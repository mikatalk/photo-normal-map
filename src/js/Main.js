
// main dependencies
import THREE from 'three';

// main scss
import '../sass/app.scss';

import Step01 from './steps/01/Step01'; 
import Step02 from './steps/02/Step02'; 

const pages = [
    { hash:'#sand', class: Step01 },
    { hash:'#paper', class: Step02 },
];

let app = null;

readRoute();

function readRoute () {

    for ( let i=0,l=pages.length; i<l; i++ ) {
        let page = pages[i];
        if ( page.hash == window.location.hash ) {
            let previous = i > 0 ? pages[i-1].hash : '';
            let next = i < l-1 ? pages[i+1].hash : '';
            setNewApp(page.class, page.hash, previous, next);
            return;
        }
    }
    // default fallback:
    window.location.hash = pages[pages.length-1].hash;
    setNewApp( pages[pages.length-1].class, pages[pages.length-1].hash, 
        pages[pages.length-2].hash, '');
}

function setNewApp(Class, hash, previous, next) {
    console.log(' --', hash.replace('#','') );
    app = new Class;
    if ( previous != '' ) {
        let a = document.createElement('a');
        a.setAttribute('href', 'javascript:window.updateRoute("'+previous+'");');
        a.setAttribute('class','arrow-anchor left');
        a.innerHTML = '<span><</span>' + previous.replace('#','');
        document.body.appendChild(a);
    }
    if ( next != '' ) {
        let a = document.createElement('a');
        a.setAttribute('href', 'javascript:window.updateRoute("'+next+'");');
        a.setAttribute('class','arrow-anchor right');
        a.innerHTML = next.replace('#','') + '>';
        document.body.appendChild(a);
    }   
}

function updateRoute(hash) {
    window.location.hash = hash;
    window.location.reload();
}
window.updateRoute = updateRoute;
