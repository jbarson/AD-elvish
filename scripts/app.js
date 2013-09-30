//(function () {
   //"use strict";
var map = map || {};
    map.systems = [];
    map.links = [];
    map.homeworlds=[0,21,36];
    map.tmpVec1 = new THREE.Vector3();
    map.tmpVec2 = new THREE.Vector3();
    map.tmpVec3 = new THREE.Vector3();
    map.tmpVec4 = new THREE.Vector3();
    map.Scale = 200;

map.init = function() {
  map.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 75000 );
  map.camera.position.z = 5000;
  map.scene = new THREE.Scene();
  for (var i in systemsArr){
    var starText = "starText";
    var system = systemsArr[i];
    var starType = system.type[0][0].toUpperCase();
    var systemDiv = document.createElement('div');
    systemDiv.className = "starDiv";
    var starPic = document.createElement('img');
    if (starType==="A"){
      starPic.src = 'img/A-star.png';
    }else if (starType==="F"){
      starPic.src = 'img/F-star.png';
    }else if (starType==="G"){
      starPic.src = 'img/G-star.png';
    }else if (starType==="K"){
      starPic.src = 'img/K-star.png';
    }else if (starType==="M"){
      starPic.src = 'img/M-star.png';
    }else if (starType==="D"){
      starPic.src = 'img/D-star.png';
    }else{
      starPic.src = 'img/spark1.png';
    }
    systemDiv.appendChild(starPic);
    var name = document.createElement('div');
    name.className = starText;
    name.textContent = system.sysName;
    systemDiv.appendChild(name);
    if (system.planetName){var planet = document.createElement('div');
      planet.className = starText;
      planet.textContent = system.planetName;
      systemDiv.appendChild(planet);
    }
    var star = new THREE.CSS3DObject(systemDiv);
    star.position.x = system.x*map.Scale;
    star.position.y = system.y*map.Scale;
    star.position.z = system.z*map.Scale;
    map.scene.add( star );
    map.systems.push(star);
  }
  var systemIndex = _.pluck(systemsArr,"id");
  for (var j in jumpList){
    var startSys=systemsArr[jumpList[j][0]];
    var endSys=  systemsArr[jumpList[j][1]];
    var startPos=map.systems[jumpList[j][0]].position;
    var endPos=  map.systems[jumpList[j][1]].position;
    map.tmpVec1.subVectors( endPos, startPos );
    var linkLength = map.tmpVec1.length() -25;
    var hyperLink=document.createElement('div');
    hyperLink.className="jumpLink";
    hyperLink.style.height=  linkLength + "px";
    var object = new THREE.CSS3DObject( hyperLink );
    object.position.copy( startPos );
    object.position.lerp( endPos, 0.5 );
    var axis = map.tmpVec2.set( 0, 1, 0 ).cross( map.tmpVec1 );
    var radians = Math.acos( map.tmpVec3.set( 0, 1, 0 ).dot( map.tmpVec4.copy( map.tmpVec1 ).normalize() ) );
    var objMatrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );
    object.matrix = objMatrix;
    object.rotation.setEulerFromRotationMatrix( object.matrix, object.eulerOrder );
    object.matrixAutoUpdate = false;
    object.updateMatrix();

    map.scene.add( object );
    map.links.push( object );
  }
  map.renderer = new THREE.CSS3DRenderer();
  map.renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById( 'container' ).appendChild( map.renderer.domElement );
  map.controls = new THREE.TrackballControls( map.camera, map.renderer.domElement );
  map.controls.rotateSpeed = 0.05;
  map.controls.dynamicDampingFactor = 0.3;
  map.controls.maxDistance=7500;
  map.controls.addEventListener( 'change', map.render );
  window.addEventListener( 'resize', map.onWindowResize, false );
};
map.onWindowResize = function() {
  map.camera.aspect = window.innerWidth / window.innerHeight;
  map.camera.updateProjectionMatrix();
  map.renderer.setSize( window.innerWidth, window.innerHeight );
  map.render();
};
map.animate = function() {
  requestAnimationFrame( map.animate );
  map.controls.update();
  map.render();
};
map.render = function() {
  for (var i in map.systems) {
    map.systems[i].lookAt(map.camera.position.clone());
    map.systems[i].up = map.camera.up.clone();
    if (map.systems[i].position.distanceTo(map.camera.position)<500){
      map.systems[i].element.children[1].className="invis";
      if (map.systems[i].element.children[2]){
        map.systems[i].element.children[2].className="invis";
      }
    }else{
      map.systems[i].element.children[1].className="starText";
      if (map.systems[i].element.children[2]){
        map.systems[i].element.children[2].className="planetText";
      }
    }
  }
  map.renderer.render( map.scene, map.camera );
};

map.init();
map.animate();

map.dist = function  (sys1,sys2) {
  return Math.sqrt(Math.pow(Math.abs(sys1.x-sys2.x),2)+Math.pow(Math.abs(sys1.y-sys2.y),2)+Math.pow(Math.abs(sys1.z-sys2.z),2));
};

map.fillJumpList = function () {
    for (var j = 0; j <= 10; j++) {
      for (var i in systemsArr) {
        var origin = parseInt(i,10);
        var target = systemsArr[origin].distList[0][1];
        while (systemsArr[target].push<=0){
          systemsArr[origin].distList.splice(0,1);
          target = systemsArr[origin].distList[0][1];
        }
        if (systemsArr[origin].push>0 && origin !== target){       
          systemsArr[origin].distList.splice(0,1);
          for (var k in systemsArr[target].distList){
            if (systemsArr[target].distList[k][1]===origin){
              systemsArr[target].distList.splice(k,1);
            }
          }
          jumpList.push([origin,target]);
          --systemsArr[origin].push;
          --systemsArr[target].push;
        }
      }
    }
    jumpList.sort(function(a,b){return a[0]-b[0];});
};

map.fillDistList = function(){

  for (var i in systemsArr){
    systemsArr[i].distList = [];
    for (var j in systemsArr){
      systemsArr[i].distList.push([map.dist(systemsArr[i],systemsArr[j]),parseInt(j,10)]);
    }
    systemsArr[i].distList.sort(function(a,b){return a[0]-b[0];});
    systemsArr[i].distList.splice(0,1);
  }
};
map.locateLinks = function(sys){
  //takes a system number ad returns all the links associated with that system
  var links = [];
  for (var i in jumpList){
    if (jumpList[i][0]===sys||jumpList[i][1]===sys){
      links.push(jumpList[i]);
    }
  }
  return links;
};
map.buildStarLinks = function(sys){
  var starList = _.without(_.range(systemsArr.length),sys);
  var output=[];
  iteration=0;
  output.push([sys]);
  while(starList.length>_.flatten(output).length){
    var result =[];
    for (var i in output[iteration]){
      result.push(map.oneLinkAway(output[iteration][i]));
    }
    var flatOutput=_.flatten(output);
    result =_.difference(_.uniq(_.flatten(result)),flatOutput);
    output.push(result);
    ++iteration;
  }
  return output;
};
map.oneLinkAway = function(sys){
  var output =[];
  for (var i in jumpList){
    if(jumpList[i][0]===sys){
      output.push(jumpList[i][1]);
    }
    if(jumpList[i][1]===sys){
      output.push(jumpList[i][0]);
    }
  }
  return output;
};
map.generateRecourceCentres = function(){
  var starList = _.without(_.range(systemsArr.length),sys);
  var green,brown,yellow,greenEligible,brownEligible,yellowEligible, barren;
  var numGreen,numBrown,numYellow;
  //set resourees at homeworlds
  for (var i in map.homeworlds){
    green.push(map.homeworlds[i]);
    brown.push(map.homeworlds[i]);
  }
  return{"green":green,"brown":brown,"yellow":yellow};
};


