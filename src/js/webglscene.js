import * as THREE from 'three'
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from './examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from './examples/jsm/lights/RectAreaLightUniformsLib.js';
import Stats from './examples/jsm/libs/stats.module.js';
const TWEEN = require('@tweenjs/tween.js');
var camera;
var controls;
export function render_welcome_scene(){
    var renderer;
    var scene;
    let stats
    init()
    function init(){
        let container = document.getElementById("app") 
        document.body.appendChild(container)
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth+30, window.innerHeight+20 );
        renderer.setAnimationLoop( animation );
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild( renderer.domElement );

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.set( 0, 5, - 15 );

        scene = new THREE.Scene();

        RectAreaLightUniformsLib.init();

        const rectLight1 = new THREE.RectAreaLight( 0xff0012, 5, 4, 10 );
        rectLight1.position.set( - 5, 5, 5 );
        scene.add( rectLight1 );

        const rectLight2 = new THREE.RectAreaLight( 0x00ff00, 5, 4, 10 );
        rectLight2.position.set( 0, 5, 5 );
        scene.add( rectLight2 );

        const rectLight3 = new THREE.RectAreaLight( 0x0000ff, 5, 4, 10 );
        rectLight3.position.set( 5, 5, 5 );
        scene.add( rectLight3 );

        scene.add( new RectAreaLightHelper( rectLight1 ) );
        scene.add( new RectAreaLightHelper( rectLight2 ) );
        scene.add( new RectAreaLightHelper( rectLight3 ) );

        const geoFloor = new THREE.BoxGeometry( 2000, 0.1, 2000 );
        const matStdFloor = new THREE.MeshStandardMaterial( { color: 0x808080, roughness: 0.1, metalness: 0 } );
        const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
        scene.add( mshStdFloor );

        const geoKnot = new THREE.TorusKnotGeometry( 1.5, 0.5, 200, 16 );
        const matKnot = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0 } );
        const meshKnot = new THREE.Mesh( geoKnot, matKnot );
        meshKnot.name = 'meshKnot';
        meshKnot.position.set( 0, 5, 0 );
        scene.add( meshKnot );

        controls = new OrbitControls( camera, renderer.domElement );
        controls.target.copy( meshKnot.position );
        controls.enableZoom = false;

        controls.update();

        //

        window.addEventListener( 'resize', onWindowResize );


    }

    function onWindowResize() {

        renderer.setSize( window.innerWidth+30, window.innerHeight+20 );
        camera.aspect = ( window.innerWidth / window.innerHeight );
        camera.updateProjectionMatrix();

    }
    var done;
    var done1;
    function animation( time ) {
        setTimeout(function() {
            done = true
        }, 3000)
        if(done == true){animation2(camera.position.x, camera.position.y, camera.position.z, time ); return}
        const mesh = scene.getObjectByName( 'meshKnot' );
        mesh.rotation.y = time / 1000;
        camera.position.x = time / 1000;
        camera.position.y = time / 1000;
        renderer.render( scene, camera );
    }  
    function animation2(x, y, z , time){
        const mesh = scene.getObjectByName( 'meshKnot' );
        mesh.rotation.y = time / 1000
        camera.position.set( x, y, z );
        renderer.render( scene, camera );
        $("#titles").fadeIn()
        $(".start").fadeIn()
    }
    function animation3(x, y, z, time){
        
    }
}
export function webgl_support () { 
    try {
     var canvas = document.createElement('canvas'); 
     return !!window.WebGLRenderingContext &&
       (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch(e) {
      return false;
    }
  };
 
  export default function app(){Vue.createApp({
    data(){
        return {
            level : "welcome_1",
            user : localStorage.getItem("user"),
            question : "Connectant...",
            choice: "",
            answer: "",
            failed:false,
            status : "Començar"

        }
    },
    methods:{
        loadQuestions : function loadQuestionInGame(){
            document.getElementById("question").innerHTML = this.question
        },
        zoomIn : function zoomIn(minZoom){

        },
        start : function start(){
            this.user = localStorage.getItem("user");
            if(this.user != null){
                window.location = "/game"
            }
            else{
                swal({
                    title:"Introdueix un nom d'usuari",
                    text:"Introdueix el teu nom d'usuari per a començar",
                    content:"input",
                    button: {
                        text: "OK",
                        closeModal: true,
                    },
                }).then(username => {
                    if(username){
                        localStorage.setItem("user", username)
                        localStorage.setItem("lvl", 0)
                        this.start()
                    }
                })
            }

        }
    },
    mounted(){
        this.$socket = io()
        this.$socket.on("question", (data) => {
            this.question = data.question
            this.choice = data.choice
            this.answer = data.answer
            this.failed = false
        })
        this.$socket.on("failed", () => {
            this.failed = true
        })
        this.$socket.on("end", () => {
            this.question = "Fins aviat!"
            this.choice = ""
            this.answer = ""
            this.failed = false
        })
        }

}).mount('#app')
}

