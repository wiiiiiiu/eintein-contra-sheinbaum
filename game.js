// game.js

// ======================================
// IMAGENES
// ======================================

const IMAGES = {

  plants:{

    peashooter:"img/peashooter.png",
    sunflower:"img/sunflower.png",
    wallnut:"img/wallnut.png"

  },

  zombies:{

    normal:"img/zombie.png",
    cone:"img/conehead.png",
    bucket:"img/buckethead.png"

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

let suns = 200;
let selectedPlant = null;

const plants = [];
const zombies = [];
const bullets = [];

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
  }
};

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
// SELECCIONAR CARTA
// ======================================

document.querySelectorAll(".card").forEach(card=>{

  card.addEventListener("click", ()=>{

    document.querySelectorAll(".card")
      .forEach(c=>c.classList.remove("selected"));

    card.classList.add("selected");

    selectedPlant = card.dataset.plant;
  });

});

// ======================================
// CREAR PLANTA
// ======================================

function createPlant(type, cell, row, col){

  const plant = document.createElement("img");

  plant.src = IMAGES.plants[type];

  plant.classList.add("plant");

  cell.appendChild(plant);

  const data = {

    type,
    element:plant,
    row,
    col,

    hp:PLANT_DATA[type].hp,

    cooldown:0
  };

 plants.push(data);
}

// ======================================
// CREAR ZOMBIE
// ======================================

function createZombie(type, row){

  const zombie = document.createElement("div");

  zombie.classList.add("zombie");

  const img = document.createElement("img");

  img.src = IMAGES.zombies[type];

  img.style.width = "100%";
  img.style.height = "100%";

  zombie.appendChild(img);

  const hpBar = document.createElement("div");
  hpBar.classList.add("health");

  zombie.appendChild(hpBar);

  grid.appendChild(zombie);

  let hp = 100;
  let speed = 0.3;

  if(type === "cone"){
    hp = 180;
  }

  if(type === "bucket"){
    hp = 300;
    speed = 0.2;
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

function createBullet(x,y,row){

  const bullet = document.createElement("div");

  bullet.classList.add("bullet");

  grid.appendChild(bullet);

  bullet.style.left = x+"px";
  bullet.style.top = y+"px";

  bullets.push({

    element:bullet,
    x,
    y,
    row,
    speed:5
  });
}

// ======================================
// UPDATE SOLES
// ======================================

function updateSun(){

  sunCount.textContent = suns;
}

// ======================================
// SOLES
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
// LOOP
// ======================================

function gameLoop(){

  // ==================================
  // PLANTAS
  // ==================================

  plants.forEach((plant)=>{

    plant.cooldown--;

    // DISPARO
    if(plant.type === "peashooter"){

      const enemy = zombies.find(z=>z.row===plant.row);

      if(enemy && plant.cooldown <= 0){

        createBullet(
          plant.col*100+70,
          plant.row*100+40,
          plant.row
        );

        plant.cooldown = 100;
      }
    }

    // GIRASOL
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
  // BULLETS
  // ==================================

  bullets.forEach((bullet,bi)=>{

    bullet.x += bullet.speed;

    bullet.element.style.left = bullet.x+"px";

    zombies.forEach((zombie,zi)=>{

      if(zombie.row !== bullet.row) return;

      if(bullet.x > zombie.x){

        zombie.hp -= 20;

        zombie.hpBar.style.width =
          (zombie.hp/zombie.maxHp)*100 + "%";

        bullet.element.remove();

        bullets.splice(bi,1);

        if(zombie.hp <= 0){

          zombie.element.remove();

          zombies.splice(zi,1);

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

    plants.forEach((plant,pi)=>{

      if(plant.row !== zombie.row) return;

      const px = plant.col*100+20;

      if(zombie.x <= px+50){

        zombie.x += zombie.speed;

        plant.hp -= 0.4;

        if(plant.hp <= 0){

          plant.element.remove();

          plants.splice(pi,1);
        }
      }
    });

    // GAME OVER
    if(zombie.x <= -50){

      alert("GAME OVER");

      location.reload();
    }

  });

  requestAnimationFrame(gameLoop);
}

gameLoop();

// ======================================
// GENERADOR DE ZOMBIES
// ======================================

setInterval(()=>{

  const row = Math.floor(Math.random()*rows);

  const random = Math.random();

  let type = "normal";

  if(random > 0.6){
    type = "cone";
  }

  if(random > 0.85){
    type = "bucket";
  }

  createZombie(type,row);

},3000);

// ======================================
// GENERADOR DE SOLES
// ======================================

setInterval(()=>{

  createSun(

    Math.random()*800,

    Math.random()*400

  );

},6000);