import * as THREE from 'three';
import gsap from 'gsap';
//Based from here https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_morph.html


import { GUI } from './examples/jsm/libs/lil-gui.module.min.js';

import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
// Socket.io startup. 
var socket = io()
var container, stats, clock, gui, mixer, actions, activeAction, previousAction, timing;
var camera, scene, renderer, model, face;
var longitude = 0; 
var totalWritten = 0;
var written
var expressions;
// *Check user agent*, "computing power"... Because on Mozilla Firefox and edge browsers this website doesn't work at all.
if(navigator.userAgent.match(/mozilla|firefox/i) || navigator.userAgent.match(/edg/i)){
  alert("El navegador que estas utilitzant no funciona correctament amb aquesta pàgina web. Per favor utilitza un altre navegador (Chrome, Chromium, Safari...) ")
}
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
        // The camera options.
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
        camera.position.set( 0 , 3, 10 );
        camera.lookAt( new THREE.Vector3( 0, 2, 0 ) );

        scene = new THREE.Scene();
        // The image that is behind the robot.
        scene.background = new THREE.TextureLoader().load('/img/background.png')
        
        //scene.background = new THREE.Color( 0x2E86FD );
        scene.fog = new THREE.Fog( 0x2E86FD, 20, 100 );

        clock = new THREE.Clock();

        // Lights

        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        hemiLight.position.set( 10, 20, 0 );
        scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 10, 20, 10 );
        scene.add( dirLight );

        // This is the background of the robot. Not too cool. *Try to think of a better one*

        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x000000, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        scene.add( mesh );

        // model
        // Load the 3D model and set up the animations (emotes and states) | The emotions will be set up later.
        const loader = new GLTFLoader();
        loader.load( '/models/RobotExpressive.glb', function ( gltf ) {

            model = gltf.scene;
            face = model.getObjectByName( 'Head_4' );
            expressions = Object.keys( face.morphTargetDictionary )
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
            activeAction = actions[ 'Jump' ];
            activeAction.play();
            fadeToAction("Idle", 0.5)
    


        }, undefined, function ( e ) {

            console.error( e );

        } );
        // Set up renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize );


    }
    
    // To handle window resizes so it doesn't break the 3D environment.
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    //
    // The loop that is constantly running, it renders the 3D environment.
    function animate() {
        const dt = clock.getDelta();

        if ( mixer ) mixer.update( dt );

        requestAnimationFrame( animate );

        renderer.render( scene, camera );


    }
}
// Change the animation that the robot is reproducing
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
// Wait for x time.
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }
  // When pressed it will trigger the getQuestion function if the user's lvl is higher than 0
  function changeLVL(valid){
    if(valid == false) return;
    var lvl = localStorage.getItem("lvl")
    var user = localStorage.getItem("user")
    if(lvl != undefined && lvl != null && /[a-zA-Z]/.test(lvl) == false){
        if(lvl == 0){
           // animate this scene.background = new THREE.Color( 0xc82e0d);
            var msg = `Molt bé ${user}. Comencem doncs!`
            var check = setInterval(function(){
                if(written == true){
                  clearInterval(check);
                  written = false;
                  fadeToAction("Idle", 0.5)
                  localStorage.setItem("lvl", 1)
                  changeLVL()
                }
            }, 1000)
            fadeToAction("Dance", 0.5)
            escriure(msg, 50)
        }
        else{
            getQuestion(user, lvl)
        }
    }
} // Need to make it global to access it from the DOM
  window.changeLVL = changeLVL
  // This function animates the typing on the bubble. ¡TRY TO MAKE IT ASYNC SO I CAN WAIT FOR IT TO END AND NOT USE SETTIMEOUT!
  async function escriure(text, speed){
  console.log(text)
  var i = 0;
  var txt = text;
  var speed = 50; 
  longitude = 0
  totalWritten = 0
  document.getElementById("bubble").innerHTML = ""
  function typeWriter() {
    longitude = txt.length
    totalWritten += 1
    console.log(totalWritten)
    console.log(longitude)
    let check = new Promise(function(resolve){
      if(totalWritten - 1 == longitude){resolve()}
    })
    check.then((value) => {written = true})  
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
  // When a new user gets here, we will show him this.
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
      var start = setInterval(function() {
        if(written == true){
          clearInterval(start)
          written = false
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
      }, 50)
    
      })
      scriptPromise.then(() =>{})
    }, 1000)

    var questioning;
    var alreadyJumped = false;
    var alreadyWaved = false;
    // This function is called on the "start of the loop" or on "the event of the next question button being pressed".
    function getQuestion(usr, id){
      socket.emit('question',{user:usr, id:id})
      questioning = setInterval(() => {
          if(Math.floor(Math.random() * (5 - 1) + 1) == 1 && alreadyJumped == false){
            fadeToAction("Jump", 0.5)
            alreadyJumped = true
            alreadyWaved = false
            setTimeout(function(){fadeToAction("Idle", 0.5)}, 1000) 
        }
        else if(Math.floor(Math.random() * (5 - 1) + 1) == 2 && alreadyWaved == false){
          fadeToAction("Wave", 0.5)
          alreadyWaved = true
          alreadyJumped = false
          setTimeout(function(){fadeToAction("Idle", 0.5)}, 1000) 
        }
        changeMood(Math.floor(Math.random() * (3 - 0) + 0), Math.random())
      }, 2000)
    }
    // When an option is clicked from the dom, we call this funcion, that will communicate with the server.
    function checkAnswer(answer, id){
      clearInterval(questioning)
      chooseMood(1, 0)
      chooseMood(2, 0)
      chooseMood(3, 0)
    }
    // Handle incorrect answers. Change background color, ¿some animation?, robot dies.
    function failedAnswer(){
      scene.background = new THREE.Color()
      fadeToAction("Dead", 1)
    }
    // Handle correct answers.
    function correctAnswer(){

    }

    // Create the div with the options to choose from.
    function createDivWithOptions(OptionsNum, data){
      function getValues(object, value){
        return object.map((item) => {
          return item[value]
        })
      }
      const div = document.createElement("div")
      div.className = "options"
      var op = {}
      var i = 1
      var items = {1: "one", 2:"two", 3:"three", 4:"four"}
      while(i <= OptionsNum){
        var option = getValues(data, i)
        //logging console.log(option)
        op[i] = document.createElement("button")
        op[i].className = "option"
        op[i].innerHTML = "<b>"+option+"</b>"
        div.appendChild(op[i])
        i++
      }
        document.body.appendChild(div)
    }

    // Socket events
    socket.on('question', (question) => {
      escriure(question.question, 50)
      var check = setInterval(() => {
        if(written == true){
          clearInterval(check)
          written = false
          createDivWithOptions(question.options, question.answers)
        }
      })
    })
    // Change the mood of the robot to a desired value, there are 3 different moods, and they can be regulated from 0 to 1.
    function changeMood(mood, num){
      face.morphTargetInfluences[mood] = num
    }