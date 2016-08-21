# photo-normal-map
Just like the repo title says: ThreeJS with ES6 to S3 bucket boilerplate project using Webpack

Live Demo: https://mikatalk.github.io/photo-normal-map/

### Install/Setup
`npm install`

`npm run build`

### Dev
`npm run dev`

### Basic of generating normal map:
Take 4 identical photo with light source coming from north, east, west, east, as well as a 5th photo with ambient lighting.

![Alt text](https://pbs.twimg.com/media/CqXnkXNUkAI39wW.jpg "Example")

Then in your shader:
```
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
```
