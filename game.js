// ======================================
// IMAGENES
// ======================================

const IMAGES = {

  plants:{

    peashooter:"img/peashooter.png",
    sunflower:"img/sunflower.png",
    wallnut:"img/wallnut.png",
    torchwood:"img/torchwood.png",
    doomshroom:"img/doomshroom.png"

  },

  zombies:{

    normal:"img/zombie.png",
    cone:"img/conehead.png",
    bucket:"img/buckethead.png",
    boss:"img/boss.png"

  },

  sun:"img/sun.png"
};

// ======================================
// CONFIG
// ======================================

const rows = 5;
const cols = 9;

const grid = document.getElementById("grid");
const sunCount = document.getElementById("sunCount");
const timerFill = document.getElementById("timerFill");



let achievements = {
  corrupt: false,
  noPlant: false,
  bossPerfect: false,
  survivor: false
};

let zombieKillsForAchievement = 0;
let lastPlantTime = Date.now();
let plantsLostDuringBoss = 0;
let bossActive = false;

let suns = 200;

let selectedPlant = null;

let shovelMode = false;

let gameMode = "infinite";

let gameStarted = false;

let gameTime = 180;

let currentLevel = 1;

let zombiesKilled = 0;

let bossSpawned = false;

const sounds = {
  corrupt: new Audio("mp3/corrupt.mp3"),
  noPlant: new Audio("mp3/noplant.mp3"),
  boss: new Audio("mp3/boss.mp3"),
  survivor: new Audio("mp3/survivor.mp3")
};

const plants = [];
const zombies = [];
const bullets = [];
const lawnmowers = [];

// ======================================
// COSTOS
// ======================================

const PLANT_DATA = {

  peashooter:{
    cost:100,
    hp:100,
    shoot:true
  },

  sunflower:{
    cost:50,
    hp:80,
    sunProducer:true
  },

  wallnut:{
    cost:75,
    hp:400
  },

  torchwood:{
    cost:125,
    hp:140
  },

  doomshroom:{
    cost:125,
    hp:9999,
    explosive:true
  }
};

function showAchievement(text, imgSrc){

  const div = document.createElement("div");

  div.innerHTML = `
    <img src="${imgSrc}" style="width:40px;height:40px;vertical-align:middle;">
    <span>${text}</span>
  `;

  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.background = "black";
  div.style.color = "white";
  div.style.padding = "10px";
  div.style.borderRadius = "10px";
  div.style.zIndex = 9999;

  document.body.appendChild(div);

  setTimeout(()=>div.remove(), 5000);
}

// ======================================
// GRID
// ======================================

for(let r=0;r<rows;r++){

  for(let c=0;c<cols;c++){

    const cell = document.createElement("div");

    cell.classList.add("cell");

    cell.dataset.row = r;
    cell.dataset.col = c;

    grid.appendChild(cell);

    cell.addEventListener("click", ()=>{

      // ==================================
      // PALA
      // ==================================

      if(shovelMode){

        const plantElement = cell.querySelector(".plant");

        if(!plantElement) return;

        const index = plants.findIndex(
          p => p.element === plantElement
        );

        if(index !== -1){

          plants[index].element.remove();

          plants.splice(index,1);
        }

        return;
      }

      // ==================================
      // PLANTAR
      // ==================================

      if(!selectedPlant) return;

      if(cell.querySelector(".plant")) return;

      const data = PLANT_DATA[selectedPlant];

      if(suns < data.cost) return;

      createPlant(selectedPlant, cell, r, c);

      suns -= data.cost;

      updateSun();

    });
  }
}

// ======================================
// PODADORAS
// ======================================

for(let r=0;r<rows;r++){

  const mower = document.createElement("div");

  mower.classList.add("lawnmower");

  const mowerImg = document.createElement("img");

  mowerImg.src = "img/lawnmower.png";

  mowerImg.style.width = "100%";
  mowerImg.style.height = "100%";

  mower.appendChild(mowerImg);

  grid.appendChild(mower);

  mower.style.left = "0px";
  mower.style.top = (r*100+20)+"px";

  lawnmowers.push({

    row:r,
    x:0,
    active:false,
    used:false,
    element:mower

  });
}

// ======================================
// SELECCIONAR CARTA
// ======================================

document.querySelectorAll(".card").forEach(card=>{

  card.addEventListener("click", ()=>{

    if(card.id === "shovel") return;

    document.querySelectorAll(".card")
      .forEach(c=>c.classList.remove("selected"));

    card.classList.add("selected");

    selectedPlant = card.dataset.plant;

    shovelMode = false;
  });

});

// ======================================
// PALA
// ======================================

const shovel = document.getElementById("shovel");

shovel.addEventListener("click", ()=>{

  shovelMode = true;

  selectedPlant = null;

  document.querySelectorAll(".card")
    .forEach(c=>c.classList.remove("selected"));

  shovel.classList.add("selected");
});

// ======================================
// MENU
// ======================================

document.getElementById("mode3min")
.addEventListener("click", ()=>{

  gameMode = "3min";

  startGame();
});

document.getElementById("modeInfinite")
.addEventListener("click", ()=>{

  gameMode = "infinite";

  startGame();
});

function startGame(){

  document.getElementById("menu").style.display = "none";

  gameStarted = true;

  if(gameMode === "3min"){

    const interval = setInterval(()=>{

      gameTime--;

      const percent = (gameTime / 180) * 100;

      timerFill.style.width = percent + "%";

      if(gameTime <= 0){

        clearInterval(interval);

        if(currentLevel < 3){

          alert("GANASTE!");

          location.reload();

        }else{

          alert("DERROTA AL JEFE FINAL!");
        }
      }

    },1000);

 }else{

  infiniteStart = Date.now();

  timerFill.style.display = "none";
}
}

// ======================================
// CREAR PLANTA
// ======================================

function createPlant(type, cell, row, col){

  const plant = document.createElement("img");

  plant.src = IMAGES.plants[type];

  plant.classList.add("plant");

  if(type === "doomshroom"){
    plant.classList.add("doomShroom");
  }

  cell.appendChild(plant);

  const data = {

    type,
    element:plant,
    row,
    col,

    hp:PLANT_DATA[type].hp,

    cooldown:0
  };

  lastPlantTime = Date.now();

  plants.push(data);
}

// ======================================
// CREAR ZOMBIE
// ======================================

function createZombie(type, row){

  const zombie = document.createElement("div");

  zombie.classList.add("zombie");

  if(type === "boss"){
    zombie.classList.add("bossZombie");
  }

  const img = document.createElement("img");

  img.src = IMAGES.zombies[type];

  img.style.width = "100%";
  img.style.height = "100%";

  zombie.appendChild(img);

  const hpBar = document.createElement("div");

  hpBar.classList.add("health");

  zombie.appendChild(hpBar);

  grid.appendChild(zombie);

  let hp = 100 + (currentLevel * 20);

  let speed = 0.3 + (currentLevel * 0.03);

  if(type === "cone"){
    hp = 280;
  }

  if(type === "bucket"){
    hp = 400;
    speed = 0.25;
  }

  if(type === "boss"){

    hp = 10000;

    speed = 0.16;

    zombie.style.width = "180px";
    zombie.style.height = "180px";
  }

  const data = {

    type,

    element:zombie,

    row,

    x:900,

    hp,

    maxHp:hp,

    speed,

    hpBar
  };

  zombie.style.left = "900px";
  zombie.style.top = (row*100+5)+"px";

  zombies.push(data);
}

// ======================================
// BALAS
// ======================================

function createBullet(x,y,row,fire=false){

  const bullet = document.createElement("div");

  bullet.classList.add("bullet");

  if(fire){
    bullet.classList.add("fireBullet");
  }

  grid.appendChild(bullet);

  bullet.style.left = x+"px";
  bullet.style.top = y+"px";

  bullets.push({

    element:bullet,
    x,
    y,
    row,
    speed:5,
    fire
  });
}

// ======================================
// UPDATE SOLES
// ======================================

function updateSun(){

  sunCount.textContent = suns;
}

// ======================================
// CREAR SOLES
// ======================================

function createSun(x,y){

  const sun = document.createElement("img");

  sun.src = IMAGES.sun;

  sun.classList.add("sun");

  grid.appendChild(sun);

  sun.style.left = x+"px";
  sun.style.top = y+"px";

  sun.addEventListener("click", ()=>{

    suns += 25;

    updateSun();

    sun.remove();
  });

  setTimeout(()=>{

    sun.remove();

  },7000);
}

// ======================================
// LOOP PRINCIPAL
// ======================================

function gameLoop(){

  if(!gameStarted){

    requestAnimationFrame(gameLoop);

    return;
  }


  
  // ==================================
  // PLANTAS
  // ==================================

  plants.forEach((plant)=>{

    plant.cooldown--;

    // ==================================
    // PEASHOOTER
    // ==================================

    if(plant.type === "peashooter"){

      const enemy = zombies.find(z=>z.row===plant.row);

      if(enemy && plant.cooldown <= 0){

        let fire = false;

        plants.forEach(p=>{

          if(
            p.type === "torchwood" &&
            p.row === plant.row &&
            p.col > plant.col
          ){
            fire = true;
          }

        });

        createBullet(
          plant.col*100+70,
          plant.row*100+40,
          plant.row,
          fire
        );

        plant.cooldown = 100;
      }
    }

    // ==================================
    // GIRASOL
    // ==================================

    if(plant.type === "sunflower"){

      if(plant.cooldown <= 0){

        createSun(
          plant.col*100+20,
          plant.row*100+20
        );

        plant.cooldown = 500;
      }
    }

  });

  // ==================================
  // BALAS
  // ==================================

  bullets.forEach((bullet,bi)=>{

    bullet.x += bullet.speed;

    bullet.element.style.left = bullet.x+"px";

    zombies.forEach((zombie,zi)=>{

      if(zombie.row !== bullet.row) return;

      if(bullet.x > zombie.x){

        if(bullet.fire){
          zombie.hp -= 40;
        }else{
          zombie.hp -= 20;
        }

        zombie.hpBar.style.width =
          (zombie.hp/zombie.maxHp)*100 + "%";

        bullet.element.remove();

        bullets.splice(bi,1);

        if(zombie.hp <= 0){

          zombie.element.remove();

          zombies.splice(zi,1);

          zombiesKilled++;

          if(!achievements.corrupt){
         zombieKillsForAchievement++;

          if(zombieKillsForAchievement >= 100){
       
         achievements.corrupt = true;

         sounds.corrupt.play();

          showAchievement("Mata corruptos", "img/logro-corrupto.png");
         }
         } 

          checkLevelProgress();

          if(zombie.type === "boss"){

            alert("felicidades ahora busca un trabajo");

            location.reload();

            if(!achievements.bossPerfect && plantsLostDuringBoss === 0){

           achievements.bossPerfect = true;
    
           sounds.boss.play();

            showAchievement("Me la pelo tu jueguito w", "img/logro-boss.png");
           }

          }

          suns += 25;

          updateSun();
        }
      }
    });

  });

  
  
  // ==================================
  // ZOMBIES
  // ==================================

  zombies.forEach((zombie)=>{

    zombie.x -= zombie.speed;

    zombie.element.style.left = zombie.x+"px";

    // ==================================
    // COMER PLANTAS
    // ==================================

    plants.forEach((plant,pi)=>{

      if(plant.row !== zombie.row) return;

      const px = plant.col*100+20;

      if(zombie.x <= px+50){

        // ==================================
        // PETASETA
        // ==================================

        if(plant.type === "doomshroom"){

          const explosion = document.createElement("div");

          explosion.classList.add("explosion");

          explosion.style.width = "320px";
          explosion.style.height = "320px";

          explosion.style.left =
            (plant.col * 100 - 110) + "px";

          explosion.style.top =
            (plant.row * 100 - 110) + "px";

          explosion.style.background =
            "radial-gradient(circle, #d600ff, #5b0075)";

          grid.appendChild(explosion);

          setTimeout(()=>{

            explosion.remove();

          },500);

          for(let zi = zombies.length - 1; zi >= 0; zi--){

            const z = zombies[zi];

            const dx =
              Math.abs(z.x - (plant.col * 100));

            const dy =
              Math.abs(z.row - plant.row);

            if(dx < 220 && dy <= 1){

  z.hp -= 300;

  z.hpBar.style.width =
    (z.hp / z.maxHp) * 100 + "%";

  if(z.hp <= 0){

    z.element.remove();

    zombies.splice(zi,1);

    zombiesKilled++;

    checkLevelProgress();

          suns += 25;
         }
         }
          }

          updateSun();

          plant.element.remove();

          plants.splice(pi,1);

          return;
        }

        // ==================================
        // DAÑO NORMAL
        // ==================================

        zombie.x += zombie.speed;

        plant.hp -= 0.4;

        if(plant.hp <= 0){

          if(bossActive){
  plantsLostDuringBoss++;
}

          plant.element.remove();

          plants.splice(pi,1);
        }
      }
    });

    if(!achievements.noPlant && Date.now() - lastPlantTime >= 30000){

  achievements.noPlant = true;

  sounds.noPlant.play();

  showAchievement("¿Tas loco?", "img/logro-loco.png");
}

    // ==================================
    // PODADORAS
    // ==================================

    lawnmowers.forEach((mower)=>{

      if(
        !mower.used &&
        zombie.row === mower.row &&
        zombie.x <= 40
      ){
        mower.active = true;
        mower.used = true;
      }

    });

    // ==================================
    // GAME OVER
    // ==================================

    if(zombie.x <= -50){

      alert("GAME OVER");

      location.reload();
    }

  });

  // ==================================
  // MOVER PODADORAS
  // ==================================

  lawnmowers.forEach((mower)=>{

    if(!mower.active) return;

    mower.x += 8;

    mower.element.style.left = mower.x + "px";

    for(let zi = zombies.length - 1; zi >= 0; zi--){

      const z = zombies[zi];

      if(
        z.row === mower.row &&
        Math.abs(z.x - mower.x) < 80
      ){

        z.element.remove();

        zombies.splice(zi,1);

        zombiesKilled++;

        checkLevelProgress();

        suns += 25;

        updateSun();
      }
    }

    if(mower.x > 950){

      mower.active = false;

      mower.element.remove();
    }

  });

  requestAnimationFrame(gameLoop);
}

// ======================================
// NIVELES
// ======================================

function checkLevelProgress(){

  // NIVEL 2
  if(
    currentLevel === 1 &&
    zombiesKilled >= 15
  ){

    currentLevel = 2;

    alert("NIVEL 2");
  }

  // NIVEL 3
  if(
    currentLevel === 2 &&
    zombiesKilled >= 35
  ){

    currentLevel = 3;

    alert("NIVEL 3 - JEFE FINAL");
  }

// JEFE
if(currentLevel === 3 && !bossSpawned){

  bossActive = true;
  plantsLostDuringBoss = 0;

  bossSpawned = true;

  createZombie(
    "boss",
    Math.floor(Math.random()*rows)
  );
}
}

gameLoop();



// ======================================
// GENERADOR DE ZOMBIES
// ======================================

setInterval(()=>{

  if(!gameStarted) return;

  let amount = 2;

  if(currentLevel === 2){
    amount = 3;
  }

  if(currentLevel === 3){

    if(bossSpawned){
      amount = 0;
    }else{
      amount = 1;
    }
  }

  for(let i=0;i<amount;i++){

    const row =
      Math.floor(Math.random()*rows);

    const random = Math.random();

    let type = "normal";

    if(random > 0.5){
      type = "cone";
    }

    if(random > 0.8){
      type = "bucket";
    }

    createZombie(type,row);

  }

},2500);


// LOGRO INFINITO
if(gameMode === "infinite" && !achievements.survivor){

  if(Date.now() - infiniteStart >= 600000){

    achievements.survivor = true;

    sounds.survivor.play();

    showAchievement(
      "Domador de corrupción",
      "img/logro-corrupcion.png"
    );
  }
}

requestAnimationFrame(gameLoop);

// ======================================
// GENERADOR DE SOLES
// ======================================

setInterval(()=>{

  if(!gameStarted) return;

  createSun(

    Math.random()*800,

    Math.random()*400

  );

},6000);
