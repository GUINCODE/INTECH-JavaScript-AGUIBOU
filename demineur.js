/**
 * 
 * Le code metier
 */

let Demineur = {
  name: "Demineur",
  levels: {
    facile: {
      lines: 5,
      columns: 5,
      bombes: 3,
    },
    normal: {
      lines: 8,
      columns: 8,
      bombes: 10,
    },
    dificile: {
      lines: 10,
      columns: 10,
      bombes: 20,
    },
    extreme: {
      lines: 16,
      columns: 16,
      bombes: 100,
    },
  },

  params: {},

  game: {
    status: 0,
    field: new Array(),
  },

  initialise: function () {
    this.startGame("facile");
  },

  startGame: function (niveau) {
    this.params = this.levels[niveau];
    this.drawGameBoard();
    this.resetGame();
  },

  drawGameBoard: function () {
    board = document.querySelector(".plateau");
    board.innerHTML = "";

    document.querySelector(".result").innerHTML = "";

    border = document.createElement("table");
    border.setAttribute("oncontextmenu", "return false;");
    field = document.createElement("tbody");
    border.appendChild(field);
    border.className = "field";

    board.appendChild(border);

    for (i = 1; i <= this.params["lines"]; i++) {
      line = document.createElement("tr");
      //creation des cellules
      for (j = 1; j <= this.params["columns"]; j++) {
        cell = document.createElement("td");
        cell.id = "cell-" + i + "-" + j;
        cell.className = "cell";
        cell.setAttribute(
          "onclick",
          this.name + ".checkPosition(" + i + ", " + j + ", true); probableCounter()"
        );
        cell.setAttribute(
          "oncontextmenu",
          this.name + ".markPosition(" + i + ", " + j + "); return false;"
        );
        line.appendChild(cell);
      }
      field.appendChild(line);
    }
  },

  resetGame: function () {
    /* Creons le champ, vide */
    this.game.field = new Array();
    for (i = 1; i <= this.params["lines"]; i++) {
      this.game.field[i] = new Array();
      for (j = 1; j <= this.params["columns"]; j++) {
        this.game.field[i][j] = 0;
      }
    }

    /* Ajoutons les bombes */
    for (i = 1; i <= this.params["bombes"]; i++) {
      /* On place les bombes de facon aleatoire */
      x = Math.floor(Math.random() * (this.params["columns"] - 1) + 1);
      y = Math.floor(Math.random() * (this.params["lines"] - 1) + 1);
      while (this.game.field[x][y] == -1) {
        x = Math.floor(Math.random() * (this.params["columns"] - 1) + 1);
        y = Math.floor(Math.random() * (this.params["lines"] - 1) + 1);
      }
      this.game.field[x][y] = -1;

      /* On met a jour les donnees des cellules adjacentes */
      for (j = x - 1; j <= x + 1; j++) {
        if (j == 0 || j == this.params["columns"] + 1) continue;
        for (k = y - 1; k <= y + 1; k++) {
          if (k == 0 || k == this.params["lines"] + 1) continue;
          if (this.game.field[j][k] != -1) this.game.field[j][k]++;
        }
      }
    }

    /* On definit le status au mode jeu */
    this.game.status = 1;
  },

  checkPosition: function (x, y, check) {
    /* Verifie si le jeu est en fonctionnement */
    if (this.game.status != 1) return;

    /* Verifie si la cellule a deja ete visitee */
    if (this.game.field[x][y] == -2) {
      return;
    }

    /* Verifie si la cellule est marquee */
    if (this.game.field[x][y] < -90) {
      return;
    }

    /* Verifie si la cellule est un mine */
    if (this.game.field[x][y] == -1) {
      document.getElementById("cell-" + x + "-" + y).className = "cell bomb";
      this.displayLose();
      return;
    }

    /* Marque la cellule comme verifiee */
    document.getElementById("cell-" + x + "-" + y).className = "cell clear";
    if (this.game.field[x][y] > 0) {
      /* On marque le nombre de mine des cases adjacentes */
      document.getElementById("cell-" + x + "-" + y).innerHTML =
        this.game.field[x][y];
      /* On marque la case comme visitee */
      this.game.field[x][y] = -2;
    } else if (this.game.field[x][y] == 0) {
      /* On marque la case comme visitee */
      this.game.field[x][y] = -2;

      /* On devoile les cases adjacentes */
      for (var j = x - 1; j <= x + 1; j++) {
        if (j == 0 || j == this.params["columns"] + 1) continue;
        for (var k = y - 1; k <= y + 1; k++) {
          if (k == 0 || k == this.params["lines"] + 1) continue;
          if (this.game.field[j][k] > -1) {
            this.checkPosition(j, k, false);
          }
        }
      }
    }

    /* Lance la verification de la victoire si necessaire */
    if (check !== false) this.checkWin();
  },

  markPosition: function (x, y) {
    /* Verifie si le jeu est en fonctionnement */
    if (this.game.status != 1) return;

    /* Verifie si la cellule a deja ete visitee */
    if (this.game.field[x][y] == -2) return;

    if (this.game.field[x][y] < -90) {
      /* Retire le marquage */
      document.getElementById("cell-" + x + "-" + y).className = "cell";
      document.getElementById("cell-" + x + "-" + y).innerHTML = "";
      this.game.field[x][y] += 100;
    } else {
      /* Applique le marquage */
      document.getElementById("cell-" + x + "-" + y).className = "cell marked";
      document.getElementById("cell-" + x + "-" + y).innerHTML = "";
      this.game.field[x][y] -= 100;
    }
  },

  checkWin: function () {
    /* On verifie toutes les cases */
    for (var i = 1; i <= this.params["lines"]; i++) {
      for (var j = 1; j <= this.params["columns"]; j++) {
        v = this.game.field[i][j];
        if (v != -1 && v != -2 && v != -101) return;
      }
    }

    /* Aucune case bloquante trouvee, on affiche la victoire */
    this.displayWin();
  },

  displayWin: function () {
    /* Affiche le resultat dans l'espace dedie, en couleur */
    document.querySelector(".result").innerHTML = "Gagn&eacute;";
    document.querySelector(".result").style.color = "#43b456";

    /* Defini l'etat de la partie a termine */
    this.game.status = 0;
      stopCounter();
      btnPlay.classList.add("hidden");
      btnPause.classList.add("hidden");
  },

  displayLose: function () {
    /* Affiche le resultat dans l'espace dedie, en couleur */
    document.querySelector(".result").innerHTML = "Perdu";
    document.querySelector(".result").style.color = "#CC3333";
     this.game.status = 0;
   setTimeout(() => {
    stopCounter()
  btnPlay.classList.add("hidden");
  btnPause.classList.add("hidden");
    /* Defini l'etat de la partie a termine */
   
   }, 1000);

  },
  changeLevel: function (level) {  
      this.startGame(level);
  },

};

/**
 * 
 * Le code manipulant le DOM
 * 
 */
 /* initialiser le jeu apres chargement de la page*/
        window.onload = function () {
          Demineur.initialise();
        }

/* Changement de level */
const onChangeLevel=()=>{
stopCounter()
reinitialiseTimer();
level = document.querySelector(".niveau").value;
Demineur.changeLevel(level);
btnPlay.classList.add("hidden");
btnPause.classList.add("hidden");
}

/** Reprendre le jeu avec le niveau selectionner */
let reprendreBouton =document.querySelector(".reprendreBTN")
reprendreBouton.onclick = function () {
let level = document.querySelector(".niveau").value;
Demineur.changeLevel(level);
btnPlay.classList.add("hidden");
btnPause.classList.add("hidden");
reinitialiseTimer()
stopCounter()

}
/** Boutons pause et play */
let btnPause = document.querySelector(".btn_pause");
let btnPlay = document.querySelector(".btn_play");

btnPause.onclick = function () {
   btnPlay.classList.remove("hidden");
   btnPause.classList.add("hidden");
   stopCounter()
};
btnPlay.onclick = function () {
  btnPause.classList.remove("hidden");
  btnPlay.classList.add("hidden");
   counteur()
};
/** le timeur*/
let time=0
let seconds=1

let appendTime = document.querySelector(".time");
let appendSeconde = document.querySelector(".seconds");
const startTimer=()=>{
  if(seconds>59){
    appendSeconde.innerHTML = "00";
    seconds=0
    time+=1
      if (time < 9) {
        appendTime.innerHTML = "0" + time;
      } else appendTime.innerHTML = time;
  }
  if(seconds>9) {
    appendSeconde.innerHTML=seconds
  } else {
      appendSeconde.innerHTML = "0"+seconds;
  }
  seconds++
}


const counteur=()=>{
     interval=setInterval(() => {
      startTimer();
    }, 1000);
   
}

const probableCounter=()=>{
  if (typeof interval === "undefined") {
    counteur();
    btnPlay.classList.add("hidden");
    btnPause.classList.remove("hidden");
  }
}

const stopCounter=()=>{
if(typeof interval !== 'undefined')   {
     clearInterval(interval);
     delete interval;
   }
}
const reinitialiseTimer=()=>{
   time=0
   seconds=1
    appendSeconde.innerHTML = "00";
     appendTime.innerHTML = "00";
}


