import * as THREE from 'three';
//Based from here https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_morph.html


import { GUI } from './examples/jsm/libs/lil-gui.module.min.js';

import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';

var container, stats, clock, gui, mixer, actions, activeAction, previousAction, timing;
var camera, scene, renderer, model, face;
if(navigator.hardwareConcurrency <= 4) {
    timing = 4
}
else{
    timing = 1
}
console.log(timing)
export function back(){

    const api = { state: 'Idle' };

    init();
    animate();

    function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
        camera.position.set( - 5, 3, 10 );
        camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x2E86FD );
        scene.fog = new THREE.Fog( 0x2E86FD, 20, 100 );

        clock = new THREE.Clock();

        // lights

        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        hemiLight.position.set( 0, 20, 0 );
        scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 0, 20, 10 );
        scene.add( dirLight );

        // ground

        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x000000, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        scene.add( mesh );


        // model

        const loader = new GLTFLoader();
        loader.load( '/models/RobotExpressive.glb', function ( gltf ) {

            model = gltf.scene;
            scene.add( model );
            actions = {};
            mixer = new THREE.AnimationMixer( model );
            const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
            const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];
            for ( let i = 0; i < gltf.animations.length; i ++ ) {
    
                const clip = gltf.animations[ i ];
                const action = mixer.clipAction( clip );
                actions[ clip.name ] = action;
    
                if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {
    
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
    
                }
    
            }
            activeAction = actions[ 'Idle' ];
            activeAction.play();
    


        }, undefined, function ( e ) {

            console.error( e );

        } );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize );

        // stats

    }
    

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    //

    function animate() {

        const dt = clock.getDelta();

        if ( mixer ) mixer.update( dt );

        requestAnimationFrame( animate );

        renderer.render( scene, camera );


    }
}

export function fadeToAction( name, duration ) {

    previousAction = activeAction;
    activeAction = actions[ name ];

    if ( previousAction !== activeAction ) {

        previousAction.fadeOut( duration );

    }

    activeAction
        .reset()
        .setEffectiveTimeScale( 1 )
        .setEffectiveWeight( 1 )
        .fadeIn( duration )
        .play();

}

back()

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }
  function changeLVL(valid){
    if(valid == false) return;
    var lvl = localStorage.getItem("lvl")
    var user = localStorage.getItem("user")
    var wait
    if(lvl != undefined && lvl != null && /[a-zA-Z]/.test(lvl) == false){
        if(lvl == 0){
            var msg = `Molt bé ${user}. Comencem doncs!`
            setTimeout(function(){
                fadeToAction("Idle", 0.5)
                localStorage.setItem("lvl", 1)
                changeLVL()
                timing > 2 ? (wait = 2) : (wait = 1)
            }, 3000 * (wait))
            fadeToAction("Dance", 0.5)
            escriure(msg, 50)
        }
        else if(lvl == 1){
            var msg = `Molt bé ${user}. NIVELL 1`
            escriure(msg, 50) // Server side.
        }
    }
}
  window.changeLVL = changeLVL
  async function escriure(text, speed){
  console.log(text)
  var i = 0;
  var txt = text;
  var speed = 50; 
  document.getElementById("bubble").innerHTML = ""
  function typeWriter() {
    if (i < txt.length) {
      if(txt.charAt(i-1) == ":" || txt.charAt(i-1) == "," || txt.charAt(i-1) == "." ){
        sleep(300)
        document.getElementById("bubble").innerHTML += txt.charAt(i);
        i++;        
    }
    else{
        document.getElementById("bubble").innerHTML += txt.charAt(i);
        i++;
    }
      setTimeout(typeWriter, speed);
    }
    else{
      return true;
    }
  }
  typeWriter();
  }

  setTimeout(function() {
      const scriptPromise = new Promise((resolve, reject) => {
      const bubble = document.createElement('div')
      bubble.className = 'bubble me'
      bubble.id = "bubble"
      document.body.appendChild(bubble)
      var user = localStorage.getItem('user')
      var msg = `Hola ${user}! Benvingut a l'escull la teva aventura del llibre "Ara que estem junts" de Roc Casagran. Estas preparat per a començar?`
      escriure(msg, 500)
      var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))//loading.io
      var start = async() =>{        
        await sleep(7500) * timing
        fadeToAction("Sitting", 0.5)
        var container = document.getElementById("bubble")
        var newData = ` 
          <div class="button-wrap">
            <input class="hidden radio-label" type="radio" name="accept-offers" id="yes-button" onclick="changeLVL()" checked="checked"/>
            <label class="button-label" for="yes-button">
              <h1>Sí</h1>
            </label>
            <input class="hidden radio-label" type="radio" name="accept-offers" id="no-button"/>
            <label class="button-label" for="no-button">
              <h1>No</h1>
            </label>
          </div>
    `
    container.innerHTML += newData
      }
      start()
    
      })
      scriptPromise.then(() =>{})
    }, 1000)
  
