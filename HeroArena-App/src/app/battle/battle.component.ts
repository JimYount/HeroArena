import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PagestateService } from '../pagestate.service';
import { BattleService } from '../battle.service';
import { RosterService } from '../roster.service';
//import { Gladiator } from '../gladiator';


@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css']
})

export class BattleComponent implements OnInit {

  //@ViewChild('canvasId', {static: false}) myCanvas: ElementRef;
  private context: CanvasRenderingContext2D;
  private playerContext: CanvasRenderingContext2D;
  private enemyContext: CanvasRenderingContext2D;
  private playerHealthContext: CanvasRenderingContext2D;
  private enemyHealthContext: CanvasRenderingContext2D;

  constructor(private pss: PagestateService, private bs: BattleService, private rs: RosterService) {
  }

  private battleWin = false;
  private battleLose = false;

  private enemyGladiators: any = [];

  private width = 1100;
  private height = 600;
  public playerImage = new Image();
  public enemyImage = new Image();

  private playerx = new Array<number>(2);
  private playery = new Array<number>(2);
  private playerspeed = new Array<number>(2);
  private playerTotalHealth = new Array<number>(2);
  private playerHealth = new Array<number>(2);
  private playerStrength = new Array<number>(2);
  private playerDexterity = new Array<number>(2);
  private playerDamage = new Array<number>(2);
  private playerDamaging = new Array<boolean>(2);

  private playerimagex = new Array<number>(2);
  private playerimagey = new Array<number>(2);

  private enterReleased = true;
  private keys = new Set();

  selectedGladiator = '';

  makeCanvas(canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d');
    window.requestAnimationFrame(() => this.draw());
  }

  // This returns the canvas to black, so the old animation frames are removed.
  // This is no longer required, as I am not restricing animation to the main
  // canvas. It can be re-implemented if that is the approach I want to pursue.
  draw() {
    //console.log("showing battle window")
    this.context.fillStyle = "ffffff";
    this.context.fillRect(0, 0, this.width, this.height);

    ///// Uncomment if you need to animate the main canvas.
    //if (this.pss.getState() == 3)
    //  window.requestAnimationFrame(() => this.draw());
  }

  makeCanvasHealthBar(canvas: HTMLCanvasElement, healthContext, index) {
    healthContext = canvas.getContext('2d');
    window.requestAnimationFrame(() => this.drawHealthBar(canvas, healthContext, index));
  }

  // Draws a green health bar on top of a red bar, over a gladiator's head
  drawHealthBar(canvas, healthContext, index) {
    healthContext.fillStyle = "red";
    healthContext.fillRect(0, 0, canvas.width, canvas.height);

    healthContext.fillStyle = "green";
    healthContext.fillRect(0, 0, canvas.width * (this.playerHealth[index] / this.playerTotalHealth[index]), canvas.height);

    // -5 on the y axis puts the health bar above the head.
    canvas.style.top = (this.playery[index] - 5) + "px";
    canvas.style.left = this.playerx[index] + "px";

    // These if statements continue re-drawing battle elements as long as
    // the battle state is true.
    if (this.pss.getState() == 3)
      window.requestAnimationFrame(() => this.drawHealthBar(canvas, healthContext, index));
  }

  // This is actually a portable canvas for displaying the player.
  // It is a small box, showing one frame of the sprite animation sheet at a time.
  makeCanvasPlayer(canvas: HTMLCanvasElement, playerContext, index) {
    playerContext = canvas.getContext('2d');
    window.requestAnimationFrame(() => this.drawPlayer(canvas, playerContext, index));
  }

  drawPlayer(canvas: HTMLCanvasElement, playerContext, index) {
    //console.log(this.playerimagex + ", " + this.playerimagey);

    // This clears old animations from the player canvas.
    if (this.bs.getPlayersChosen()){
      playerContext.clearRect(0, 0, canvas.width, canvas.height);

    // If the gladiator is a player (case 0), they move according to player controls.
    // If the gladiator is a computer (case 1), they follow the aggro combat AI.
    switch (index) {
      case 0:
        playerContext.drawImage(this.playerImage, this.playerimagex[index], this.playerimagey[index]);
        this.movePlayerZero();
        break;
      default:
        playerContext.drawImage(this.enemyImage, this.playerimagex[index], this.playerimagey[index]);
        this.aggro(canvas, playerContext, 0, index);
        break;
    }

    canvas.style.top = this.playery[index] + "px";
    canvas.style.left = this.playerx[index] + "px";

    if (this.pss.getState() == 3)
      window.requestAnimationFrame(() => this.drawPlayer(canvas, playerContext, index));
    }
  }

  ngOnInit() { }

  getEnemyGladiators() {
    this.bs.getOpponentGladiators().subscribe((userObj: Object) => {
      console.log(userObj);
      this.enemyGladiators = userObj;

      this.bs.setPlayerGladiator(this.rs.getSelectedGladiator());
    })
  }

  selectGladiator(gid) {
    console.log('selectGladiator(' + gid + ') called');
    this.selectedGladiator = this.enemyGladiators.filter(obj => {
      return obj.id === gid;
    })[0];
    console.log(this.selectedGladiator);
    this.rs.setSelectedGladiator(this.selectedGladiator);
    console.log(this.selectedGladiator['name']);
  }

  initBattle() {
    this.bs.setOpponentGladiator(this.rs.getSelectedGladiator());
    this.bs.setPlayersChosen(true);
    //console.log(this.rs.getSelectedGladiator());
    //console.log(this.bs.getOpponentGladiator());
    //console.log(this.bs.getPlayersChosen());
    //console.log((<HTMLCanvasElement>document.getElementById('canvasId')));

    if ((<HTMLCanvasElement>document.getElementById('canvasId')) != null)
      this.startBattle();
  }

  startBattle() {
    // These refer to the sprite animation sheets.
    this.enemyImage.src = 'assets/shadowlord.png';
    this.playerImage.src = 'assets/glad2.png';

    this.playerx[0] = 550;
    this.playery[0] = 400;
    this.playerspeed[0] = 5;

    this.playerimagex[0] = 0;
    this.playerimagey[0] = -520;

    this.playerx[1] = 550;
    this.playery[1] = -50;
    this.playerspeed[1] = 4;

    this.playerimagex[1] = 0;
    this.playerimagey[1] = -650;

    this.playerTotalHealth[0] = 200;
    this.playerHealth[0] = 20;
    this.playerDamage[0] = 2;
    this.playerStrength[0] = 5;
    this.playerDexterity[0] = 5;

    this.playerTotalHealth[1] = 200;
    this.playerHealth[1] = 20;
    this.playerDamage[1] = 2;
    this.playerStrength[1] = 5;
    this.playerDexterity[1] = 5;

    // Retrieves local battle variables from the gladiator object returned 
    // from the battle service
    if (this.bs.getPlayerGladiator != null) {
      this.playerTotalHealth[0] = this.bs.getPlayerGladiator().maxHealth;
      this.playerHealth[0] = this.bs.getPlayerGladiator().currentHealth;
      this.playerStrength[0] = this.bs.getPlayerGladiator().strength;
      this.playerDexterity[0] = this.bs.getPlayerGladiator().dexterity;
    }
    else {
      console.log("Failed to load player");
    }

    if (this.bs.getOpponentGladiator != null) {
      this.playerTotalHealth[1] = this.bs.getOpponentGladiator().maxHealth;
      this.playerHealth[1] = this.bs.getOpponentGladiator().currentHealth;
      this.playerStrength[1] = this.bs.getPlayerGladiator().strength;
      this.playerDexterity[1] = this.bs.getPlayerGladiator().dexterity;
    }
    else {
      console.log("Failed to load opponent");
    }


    //this.bs.getPlayerGladiator().subscribe((userObj: Object) => {

    //});

    //this.bs.getOpponentGladiator().subscribe((userObj: Object) => {

    //});

    // Auto-focuses on the canvasID element, so you don't need to click on the window to play
    (<HTMLCanvasElement>document.getElementById('canvasId')).focus();

    // Creates the different portable canvases for the different battle elements
    const canvas = <HTMLCanvasElement>document.getElementById('canvasId');
    this.makeCanvas(canvas);
    const playerCanvas = <HTMLCanvasElement>document.getElementById('player');
    this.makeCanvasPlayer(playerCanvas, this.playerContext, 0);
    const enemyCanvas = <HTMLCanvasElement>document.getElementById('enemy');
    this.makeCanvasPlayer(enemyCanvas, this.enemyContext, 1);
    const playerHealthCanvas = <HTMLCanvasElement>document.getElementById('playerHealth');
    this.makeCanvasHealthBar(playerHealthCanvas, this.playerHealthContext, 0);
    const enemyHealthCanvas = <HTMLCanvasElement>document.getElementById('enemyHealth');
    this.makeCanvasHealthBar(enemyHealthCanvas, this.enemyHealthContext, 1);
  }

  // This is the computer attack AI.
  aggro(canvas, playerContext, playerIndex, comIndex) {
    let xdif = this.playerx[playerIndex] - this.playerx[comIndex];;
    let ydif = this.playery[comIndex] - this.playery[playerIndex];
    let anim = 0;
    let movex = 0;
    let movey = 0;

    // Redirects to the correct row of the character animation sheet for the 
    // direction they are supposed to be facing to aggro towards the player
    if (Math.abs(ydif) > Math.abs(xdif)) {
      if (ydif > 0)
        anim = -520;
      else
        anim = -650;
    }
    else {
      if (xdif > 0)
        anim = -715;
      else
        anim = -585;
    }

    //console.log(this.playerDamaging[comIndex]);

    // If the enemy is out of attack range of the computer player, they run at 
    // the vector of best apprach for aggro.
    // If the enemy is within attack range of the computer player, they swing.
    if ((Math.abs(ydif) + Math.abs(xdif)) > 40) {
      movex = (this.playerspeed[comIndex] * xdif) / (Math.abs(ydif) + Math.abs(xdif));
      movey = (this.playerspeed[comIndex] * ydif) / (Math.abs(ydif) + Math.abs(xdif));
      this.movePlayer(comIndex, anim, movex, movey);
    }
    else if (!this.playerDamaging[comIndex]) {
      this.damagePlayer(canvas, playerContext, comIndex, playerIndex);
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async waitDamage(canvas, playerContext, attackerIndex, defenderIndex, originalY, i) {
    let image = this.playerImage;

    //console.log("x = " + this.playerimagex[attackerIndex])
    //console.log("y = " + this.playerimagey[attackerIndex])

    switch (attackerIndex) {
      case 0:
        image = this.playerImage;
        break;
      default:
        image = this.enemyImage;
        break;
    }


    if (originalY < -975) {
      let dif = -975 - originalY;

      if (dif % 260 == 0)
        dif = dif / 260;
      else
        dif = Math.round(dif / 260) + 1;

      originalY += 260 * dif;
    }

    this.playerimagey[attackerIndex] = originalY;

    switch (this.playerimagey[attackerIndex]) {
      case -975:
        this.playerimagex[attackerIndex] = -66 * i;
        break;
      case -845:
        this.playerimagex[attackerIndex] = -63 * i;
        break;
      default:
        this.playerimagex[attackerIndex] = -64.5 * i;
        break;
    }

    playerContext.clearRect(0, 0, canvas.width, canvas.height);
    playerContext.drawImage(image, this.playerimagex[attackerIndex], this.playerimagey[attackerIndex]);

    await this.sleep(50);

    i++;

    if (i >= 6) {
      let xdif = this.playerx[defenderIndex] - this.playerx[attackerIndex];;
      let ydif = this.playery[attackerIndex] - this.playery[defenderIndex];

      if ((Math.abs(ydif) + Math.abs(xdif)) <= 40) {
        let hitRoll = Math.random();
        if ((hitRoll * 20 + this.playerDexterity[attackerIndex] / 2 - this.playerDexterity[defenderIndex] / 2 > 10) || hitRoll == 20) {
          if (hitRoll == 20)
            this.playerHealth[defenderIndex] -= (Math.random() * 2 * this.playerStrength[attackerIndex]);
          else
            this.playerHealth[defenderIndex] -= (Math.random() * this.playerStrength[attackerIndex]);
        }
        else if(hitRoll == 1){
          this.playerHealth[attackerIndex] -= (Math.random() * this.playerStrength[defenderIndex]);
        }

        if (this.playerHealth[0] <= 0){
          this.battleLose = true;
          this.battleWin = false;
          //this.playerHealth[0] = this.playerTotalHealth[0];
          //this.playerHealth[1] = this.playerTotalHealth[1];
          this.bs.setPlayersChosen(null);
          this.bs.setPlayerGladiator(null);
        }
        else if (this.playerHealth[1] <= 0){
          this.battleWin = true;
          this.battleLose = false;
          //this.playerHealth[0] = this.playerTotalHealth[0];
          //this.playerHealth[1] = this.playerTotalHealth[1];
          this.bs.setPlayersChosen(null);
          this.bs.setPlayerGladiator(null);
        }
        //this.playerHealth[defenderIndex] -= this.playerDamage[attackerIndex];
      }

      this.playerimagey[attackerIndex] = originalY;
      this.playerimagex[attackerIndex] = 0;
      this.playerDamaging[attackerIndex] = false;
      //console.log("getting here " + this.playerDamaging[attackerIndex]);
      return;
    }

    this.waitDamage(canvas, playerContext, attackerIndex, defenderIndex, originalY, i);
  }

  // Prepares for a new battle
  resetWinLose(){
    this.battleWin = false;
    this.battleLose = false;
  }

  damagePlayer(canvas, playerContext, attackerIndex, defenderIndex) {
    this.playerDamaging[attackerIndex] = true;
    let originalY = this.playerimagey[attackerIndex];

    this.waitDamage(canvas, playerContext, attackerIndex, defenderIndex, originalY - 260, 0);
  }

  // This calls the movePlayer function in the direction of the keys actively being pressed.
  // -520, -585, etc correspond to different rows of the character animation sheet.
  movePlayerZero() {
    if (this.keys.has("ArrowUp")) {
      this.movePlayer(0, -520, 0, this.playerspeed[0]);
    }
    if (this.keys.has("ArrowLeft")) {
      this.movePlayer(0, -585, -this.playerspeed[0], 0);
    }
    if (this.keys.has("ArrowDown")) {
      this.movePlayer(0, -650, 0, -this.playerspeed[0]);
    }
    if (this.keys.has("ArrowRight")) {
      this.movePlayer(0, -715, this.playerspeed[0], 0);
    }
  }

  // Moves the 
  movePlayer(index, playerimagey, playerx, playery) {
    this.playerimagey[index] = playerimagey;

    if (this.playerimagex[index] > -512)
      this.playerimagex[index] -= 64;
    else
      this.playerimagex[index] = 0;

    this.playerx[index] += playerx;
    this.playery[index] -= playery;
  }

  // Adds the keys currently being pressed to a vector of active keys
  onKeydown(event) {
    //console.log(event);

    if (event.key === "ArrowUp") {
      this.keys.add("ArrowUp");
    }
    if (event.key === "ArrowLeft") {
      this.keys.add("ArrowLeft");
    }
    if (event.key === "ArrowDown") {
      this.keys.add("ArrowDown");
    }
    if (event.key === "ArrowRight") {
      this.keys.add("ArrowRight");
    }

    if (event.key === " ") {
      //if (!this.playerDamaging[0])
      if (this.enterReleased && this.bs.getPlayersChosen()) {
        this.enterReleased = false;
        this.damagePlayer(<HTMLCanvasElement>document.getElementById('player'), (<HTMLCanvasElement>document.getElementById('player')).getContext('2d'), 0, 1);
      }
    }

    //console.log(this.keys);
  }

  // Removes keys released from the vector of active keys
  onKeyup(event) {
    if (event.key === "ArrowUp") {
      this.keys.delete("ArrowUp");
    }
    if (event.key === "ArrowLeft") {
      this.keys.delete("ArrowLeft");
    }
    if (event.key === "ArrowDown") {
      this.keys.delete("ArrowDown");
    }
    if (event.key === "ArrowRight") {
      this.keys.delete("ArrowRight");
    }

    if (event.key === " ") {
      this.enterReleased = true;
    }
    //console.log(this.keys);
  }
}
