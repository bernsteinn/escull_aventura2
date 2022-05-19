import * as THREE from 'three';
import gsap from 'gsap';
import Swal from 'sweetalert2'
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
var dele;
var sound;
var longer;
var expressions;
var longResponses = false;
var soundTurned = false;
//Audio from Music: https://www.chosic.com/free-music/all/ 
var music = new Audio('/sounds/music.mp3');
var next = new Audio('/sounds/next.wav');
var failed = new Audio('/sounds/failed.wav');
/* Playing In The Wind by BatchBug | https://soundcloud.com/batchbug/
Music promoted by https://www.chosic.com/free-music/all/
Creative Commons CC BY 3.0
https://creativecommons.org/licenses/by/3.0/
*/
var playerLost = new Audio('/sounds/lost.mp3');

function reproduceSoundNext(){
  if(soundTurned == true){
    next.play();
  }
}
// *Check user agent*, "computing power"... Because on Mozilla Firefox and edge browsers this website doesn't work at all.
if(navigator.hardwareConcurrency <= 4) {
    timing = 4
}
else{
    timing = 1
}

export function back(){

    const api = { state: 'Idle' };
    var ajustos = document.getElementById('config')
    ajustos.innerHTML = `        <div class="switch-holder">
    <div class="switch-label">
        <i class="fa fas fa-angle-double-right"></i><span>Respostes allargades</span>
    </div>
    <div class="switch-toggle">
        <input type="checkbox" id="longer">
        <label for="longer"></label>
    </div>
</div>

<div class="switch-holder">
    <div class="switch-label">
        <i class="fa fas fa-volume-up"></i><span>Música</span>
    </div>
    <div class="switch-toggle">
        <input type="checkbox" id="sound">
        <label for="sound"></label>
    </div>
</div>

`
    longer = document.getElementById("longer")
    sound = document.getElementById("sound")
    longer.addEventListener('change', function(){
        if(longer.checked){
          longResponses = true;
        }
        else{
          longResponses = false;
        }
      })
    sound.addEventListener('change', function(){
        if(sound.checked){
          soundTurned = true;
          music.play();
          music.volume = 0.5
          music.loop = true;
        }
        else{
          soundTurned = false;
          music.volume = 0;
          playerLost.volume = 0
          music.loop = false;
        }
      })
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
// https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof InstallTrigger !== 'undefined';
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
var isBlink = (isChrome || isOpera) && !!window.CSS;
if(isOpera || isFirefox || isSafari || isIE || isEdge){
  async function checkBrowser(){
  console.warn("Aquest navegador no es del tot compatible, per tant la pàgina no funcionarà correctament.")
  window.compatible = false
  $("#dialog").dialog()
  $("#dialog").on("dialogclose", (event) =>{
    window.compatible = true
    back()
    setTimeout(function() {
      const scriptPromise = new Promise((resolve, reject) => {
      const bubble = document.createElement('div')
      bubble.className = 'bubble me'
      bubble.id = "bubble"
      document.body.appendChild(bubble)
      var user = localStorage.getItem('user')
      var msg = `Hola ${user}! Benvingut a l'escull la teva aventura del llibre "Ara que estem junts" de Roc Casagran. Estas preparat per a començar?`
      escriure(msg, 500)
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

  })
}
  checkBrowser()
}
else{
  var dialog = $("#dialog").hide()
  window.compatible = true
  back()
  setTimeout(function() {
    const scriptPromise = new Promise((resolve, reject) => {
    const bubble = document.createElement('div')
    bubble.className = 'bubble me'
    bubble.id = "bubble"
    document.body.appendChild(bubble)
    var user = localStorage.getItem('user')
    var msg = `Hola ${user}! Benvingut a l'escull la teva aventura del llibre "Ara que estem junts" de Roc Casagran. Estas preparat per a començar?`
    escriure(msg, 500)
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
            console.log("wat")
        }
        else{
            getQuestion(user, lvl)
        }
    }
} // Need to make it global to access it from the DOM
  window.changeLVL = changeLVL
  // This function animates the typing on the bubble. ¡TRY TO MAKE IT ASYNC SO I CAN WAIT FOR IT TO END AND NOT USE SETTIMEOUT!
  async function escriure(text, speed){
  var i = 0;
  var txt = text;
  var speed = 50; 
  longitude = 0
  dele = 0
  totalWritten = 0
  document.getElementById("bubble").innerHTML = ""
  function typeWriter() {
    longitude = txt.length
    totalWritten += 1
    dele += 1
    let check = new Promise(function(resolve){
      if(totalWritten - 1 == longitude){resolve()}
    })
    let checkLongitude = new Promise(function(resolve){
      if(dele > 300 && txt.charAt(i-1) == "."){resolve()}
    })
    checkLongitude.then(function(){dele = 0; document.getElementById("bubble").innerHTML = ""; $("#bubble").fadeOut(); sleep(2000);$("#bubble").fadeIn();})
    check.then((value) => {written = true})  
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

    var questioning;
    var alreadyJumped = false;
    var alreadyWaved = false;
    // This function is called on the "start of the loop" or on "the event of the next question button being pressed".
    function getQuestion(usr, id){
      socket.emit('question',{user:usr, id:id})
      $(".options").remove();
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
    // Handle incorrect answers. Change background color, ¿some animation?, robot dies.
    function failedAnswer(response){
      scene.background = new THREE.TextureLoader().load( '/img/fail.jpg' );
      if(soundTurned == true){
        music.pause();
        failed.play();
        playerLost.play();
      }
      escriure(response, 50)
      changeMood(3, 1)
      changeMood(2, 0.15)
      fadeToAction("No", 0.5)
      setInterval(function(){
        if(written == true){
          Swal.fire({
            title: 'Has perdut!',
            text: 'Vols tornar-ho a provar?',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'No, gràcies',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, vull tornar-ho a provar!'
          }).then((result) => {
            if (result.isConfirmed) {
              fadeToAction("Idle", 0.5)
              localStorage.setItem("lvl", 1)
              scene.background = new THREE.TextureLoader().load('/img/background.png')
              playerLost.pause();
              music.play();
              music.volume = 0.5;
              changeLVL()
            }
            else{
                console.log("wtf")
            }
          })
          localStorage.setItem("lvl",1)
          fadeToAction("Death", 0.5)
          written = false
        }
      }, 50)
    }
    function MakeNextButtonVisible(){
      var container = document.getElementById("bubble")
      var newData = ` 
      <div>
        <button type="button" id="nextBTN"class="slide" onclick="changeLVL()">
        <div>Següent</div>
        <i class="icon-arrow-right"></i>
        </button>   
        </div>     
  `
  container.innerHTML += newData
  var nextBTN = document.getElementById("nextBTN")
  nextBTN.addEventListener("click", reproduceSoundNext)
    }
    // Handle correct answers.
    function correctAnswer(response, nextlvl){
        escriure(response, 50)
        setInterval(function(){
          if(written == true){
            fadeToAction("ThumbsUp", 0.5)
            fadeToAction("Jump", 0.5)
            fadeToAction("Idle", 0.5)
            written = false
            localStorage.setItem("lvl", nextlvl)
            MakeNextButtonVisible()
          }
        }, 50)

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
      if(OptionsNum == 2) {
        div.style.display = "grid"
        div.style.height = "150px"
      }
      var op = {}
      var i = 1
      while(i <= OptionsNum){
        var option = getValues(data.answers, i)
        //logging console.log(option)
        op[i] = document.createElement("button")
        op[i].className = "option"
        op[i].value = `{"content": "${i}", "id": "${data.id}"}`
        op[i].id = `option${i}`
        op[i].addEventListener("click",function(){checkAnswer(JSON.parse(this.value))})
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
          createDivWithOptions(question.options, question)
        }
      })
    })
    socket.on('check', (data) => {
      if(data.lost == false && longResponses == true){
        var origx = camera.position.x
        var origy = camera.position.y
        var origz = camera.position.z
        gsap.to(camera.position,{
          duration: 4,
          z: -3,
          x: -45,
          y:15,
          onComplete: renderDIV,

          ease: "power3.inOut",
        })
        function renderDIV(){
        var extended = document.createElement("div")
        var advise = document.createElement("h1")
        advise.innerHTML = "Clica a qualsevol part de la pantalla per a tornar al joc."
        advise.className = "click-advice"
        document.body.appendChild(advise)
        extended.className = "extended"
        extended.innerHTML = `${data.extended}`
        document.body.appendChild(extended)
        }
        $("#bubble").fadeOut()
        function animationDone(){
          $("#bubble").fadeIn();$(".extended").remove(); $(".click-advice").remove();correctAnswer(data.response, data.next)
          window.removeEventListener('mousedown', animationLeft)
        }
        function animationLeft(){
          $(".extended").fadeOut(3000)
          $(".click-advice").fadeOut(3000)
          gsap.to(camera.position,{
            duration: 4,
            z: origz,
            x: origx,
            y: origy,
            onComplete: animationDone,
            ease: "power3.inOut",
          })

        }
        window.addEventListener('mousedown', animationLeft)
      }
      else if(data.lost == false){
        correctAnswer(data.response, data.next)
      }
        else{
          if(longResponses == true){
            var origx = camera.position.x
            var origy = camera.position.y
            var origz = camera.position.z
            gsap.to(camera.position,{
              duration: 4,
              z: -3,
              x: -45,
              y:15,
              onComplete: renderDIV,
    
              ease: "power3.inOut",
            })
            function renderDIV(){
            var extended = document.createElement("div")
            var advise = document.createElement("h1")
            advise.innerHTML = "Clica a qualsevol part de la pantalla per a tornar al joc."
            advise.className = "click-advice"
            document.body.appendChild(advise)    
            extended.className = "extended"
            extended.innerHTML = `${data.extended}`
            document.body.appendChild(extended)
            }
            $("#bubble").fadeOut()
            if(soundTurned == true){
              music.pause();
              playerLost.play();
            }
            function animationDone(){
              $("#bubble").fadeIn();$(".extended").remove();failedAnswer(data.response)
              window.removeEventListener('mousedown', animationLeft)
            }
            function animationLeft(){
              $(".click-advice").fadeOut(3000)
              $(".extended").fadeOut(3000)
              gsap.to(camera.position,{
                duration: 4,
                z: origz,
                x: origx,
                y: origy,
                onComplete: animationDone,
                ease: "power3.inOut",
              })
    
            }
            window.addEventListener('mousedown', animationLeft)
    
          }
          else{
            failedAnswer(data.response)
          }
      }
    })
    // Change the mood of the robot to a desired value, there are 3 different moods, and they can be regulated from 0 to 1.
    function changeMood(mood, num){
      face.morphTargetInfluences[mood] = num
    }
        // When an option is clicked from the dom, we call this funcion, that will communicate with the server.
    function checkAnswer(answer){
          $(".options").remove();
          clearInterval(questioning)
          socket.emit('check', answer)
          changeMood(1, 0)
          changeMood(2, 0)
          changeMood(3, 0)
        }
    