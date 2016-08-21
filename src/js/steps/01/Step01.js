import THREE from 'three';
// import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';
// import * as dat from 'libs/utils/dat.gui.min';
import randomColor from 'randomcolor';
import RTT from './RTT';


const frameSize = { x:512, y:512 };

const vertexShader = `
    
    precision mediump float;

    varying vec2 vUv;
       
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    
`;

const fragmentShader = `
    
    precision mediump float;

    uniform float time;

    uniform sampler2D imageTop;
    uniform sampler2D imageBottom;

    uniform sampler2D imageRight;
    uniform sampler2D imageLeft;

    uniform vec3 color;
    
    varying vec2 vUv;

    float cheapLuma ( vec3 rgb ) {
        return ( rgb.r + rgb.r + rgb.b + rgb.g + rgb.g + rgb.g ) / 6.0;
    }

    void main () {

        vec4 pixelTop = texture2D(imageTop, vUv);
        float lTop = cheapLuma( pixelTop.rgb );
        
        vec4 pixelBottom = texture2D(imageBottom, vUv);
        float lBottom = cheapLuma( pixelBottom.rgb );

        vec4 pixelRight = texture2D(imageRight, vUv);
        float lRight = cheapLuma( pixelRight.rgb );
        
        vec4 pixelLeft = texture2D(imageLeft, vUv);
        float lLeft = cheapLuma( pixelLeft.rgb );

        gl_FragColor = vec4( lRight - lLeft, 0.0, lTop - lBottom, 1.0 );

        // gl_FragColor = vec4( color.rgb * abs(sin(vUv.x * 100.0)) * abs(sin(vUv.y * 100.0 + time*4.0)), 1.0);
    }

`;


export default class Step01 {

    constructor () {


        this.loader = new THREE.TextureLoader();

        this.mousePosition = new THREE.Vector2();

        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1000;
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
 
        document.body.appendChild( this.renderer.domElement );

        this.rtt = new RTT(512, 512, this.mousePosition);
        // this.rtt.render( this.renderer, this.clock.getDelta());

        this.mesh = this.newMesh();
        this.scene.add( this.mesh );


        // let ambientLight = new THREE.AmbientLight( 0x888888 );
        let ambientLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add( ambientLight );

        this.light = new THREE.PointLight( 0xffffff, 1.0, 5000 );
        this.scene.add( this.light );
        this.light.position.z = this.camera.position.y;

        document.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

        this.onWindowResize();
        this.onMouseMove( {clientX:window.innerWidth/2, clientY:window.innerHeight/2} );
        this.animate();


    }

    onMouseMove(event) {

        this.mousePosition.x = (( event.clientX + document.body.scrollLeft ) / window.innerWidth - .5 ) * 2;
        this.mousePosition.y = -(( event.clientY + document.body.scrollTop ) / window.innerHeight - .5 ) * 2;
        this.light.position.x = window.innerWidth/2 * this.mousePosition.x;
        this.light.position.y = window.innerHeight/2 * this.mousePosition.y;
        this.light.position.z = this.camera.position.z/2;

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        let scaleWidth = window.innerWidth/frameSize.x;
        let scaleHeight = window.innerHeight/frameSize.y;

        if ( scaleWidth < scaleHeight )
            this.camera.position.z = frameSize.x / this.camera.aspect / (2 * Math.tan(this.camera.fov / 2 * (Math.PI / 180)));
        else
            this.camera.position.z = frameSize.y / (2 * Math.tan(this.camera.fov / 2 * (Math.PI / 180)));             
    }

    newMesh () {

        this.paperTexture = this.loader.load('img/center-512.png');

        // let geometry = new THREE.SphereGeometry( 200, 60, 60);
        let geometry = new THREE.PlaneBufferGeometry( frameSize.x, frameSize.y );
        let material = new THREE.MeshPhongMaterial( { 
            // color: 0xffffff,
            color: 0x777777,
            // color: 0,
            // map: this.loader.load('img/center-512.png'),
            map: this.paperTexture,
            shininess: 1,
            specular: 0xBBBBBB,
            // specular: 0x666666,
            specularMap: this.rtt.texture.texture,
            normalMap: this.rtt.texture.texture,
            normalScale: new THREE.Vector2( 1, 1 ),
            side: THREE.DoubleSide
        });

        return new THREE.Mesh( geometry, material );
    }


    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );
     
        this.rtt.render( this.renderer, this.clock.getDelta());

        this.renderer.render( this.scene, this.camera );
    }

};
