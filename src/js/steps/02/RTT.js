import THREE from 'three';
import randomcolor from 'randomcolor';

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

        float distX = (1.0-lLeft + lRight)/2.0; 
        float distY = (1.0-lBottom + lTop)/2.0; 
        gl_FragColor = vec4( distX, distY, 1.0, 1.0 );
    }

`;


export default class RTT {

    constructor (width, height, mousePosition) {

        this.loader = new THREE.TextureLoader();

        this.lifetime = 0;

        this.camera = new THREE.OrthographicCamera( 
            width / -2,   width / 2,
            height / 2,    height / - 2, -10000, 10000 );

        this.scene = new THREE.Scene();

        this.texture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, 
            { 
                minFilter: THREE.LinearFilter, 
                magFilter: THREE.LinearFilter, 
                format: THREE.RGBFormat 
            });

        let geometry = new THREE.PlaneBufferGeometry( width, height );
        let material = new THREE.ShaderMaterial( {
            uniforms: { 
                // imageTop    : { type: "t",  value:  this.loader.load('img/top-512.png') },
                // imageBottom : { type: "t",  value:  this.loader.load('img/bottom-512.png') },
                // imageRight  : { type: "t",  value:  this.loader.load('img/right-512.png') },
                // imageLeft   : { type: "t",  value:  this.loader.load('img/left-512.png') },
                imageTop    : { type: "t",  value:  this.loader.load('img/paper-top-512.png') },
                imageBottom : { type: "t",  value:  this.loader.load('img/paper-bottom-512.png') },
                imageRight  : { type: "t",  value:  this.loader.load('img/paper-right-512.png') },
                imageLeft   : { type: "t",  value:  this.loader.load('img/paper-left-512.png') },
                lightPos    : { type: "2f", value:  mousePosition },
                time        : { type: "f",  value:  0 },
                color       : { type: "c",  value:  new THREE.Color( randomcolor() ) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending
        });

        this.quad = new THREE.Mesh( geometry, material );
        this.scene.add( this.quad );

    }

    render (renderer, delta) {

        this.lifetime += delta*3;

        this.quad.material.uniforms.time.value = this.lifetime;

        renderer.render( this.scene, this.camera, this.texture, true );
    }
}
