window.onload = function() {
	
	//Constantes
	var WIDTH=960, HEIGHT=580;
	var TAMANO=32, FILAS=16, COLS=30;
	var DESPEJADO=0, OCUPADO=1; 
	var LA=0, LB=1, LC=2, LD=3, LE=4;
	//Variables
	var canvas, ctx;
	var escena;
	var seleccionados;
	var cuantos;
	var puntos = 0;
	var aux = 0;
	var best = localStorage.getItem("adlrg_same_best");;
	if( best === null || best === "null") {
		best = 0;
	}
	//Objetos
	function Cuadro(x, y , tamano, valor, estado) {
		this.x = x;
		this.y = y;
		this.tamano = tamano;
		this.valor = valor;
		this.estado = estado;
		this.seleccionado = false;
	}
	//Objetos JSON
	var escenario = {
		cuadro: null,
		
		init: function() {
			escena = [ ];
			var val;
			for (var x=0; x < COLS; x++ ) {
			escena[x] = [ ];
				for (var y=0; y < FILAS; y++ ) {
					val = Math.floor(Math.random()*5);
					escena[x][y] = new Cuadro(x*TAMANO, y*TAMANO, TAMANO, val, OCUPADO);
				}
			}
			this.cuadro = escena;
		},
		
		draw: function() {
			var letra;
			for (var x=0; x < COLS; x++ ) {
				for (var y=0; y < FILAS; y++ ) {
					if (!this.cuadro[x][y].seleccionado)
					{
						ctx.fillStyle = "blue";
						switch(this.cuadro[x][y].valor) {
							case LA:
								ctx.fillStyle = "#1016B9";
								letra = "A";
								break;
							case LB:
								ctx.fillStyle = "#D71818";	
								letra = "B";
								break;
							case LC:
								ctx.fillStyle = "#F21EEF";	
								letra = "C";
								break;
							case LD:
								ctx.fillStyle = "#F7F138";	
								letra = "D";
								break;
							case LE:
								ctx.fillStyle = "#48F6F3";	
								letra = "E";
								break;
						}
						ctx.fillRect(this.cuadro[x][y].x, this.cuadro[x][y].y, TAMANO, TAMANO);
						ctx.strokeRect(this.cuadro[x][y].x, this.cuadro[x][y].y, TAMANO, TAMANO);
						ctx.fillStyle = "black";
						ctx.fillText(letra, this.cuadro[x][y].x + 10 , this.cuadro[x][y].y + TAMANO - 8);	
					}
					else {
						ctx.fillStyle = "white";
						ctx.fillRect(this.cuadro[x][y].x, this.cuadro[x][y].y, TAMANO, TAMANO);
					}
				}
			}
			ctx.fillStyle = "white";
			ctx.fillRect(0,FILAS*TAMANO +2, COLS*TAMANO, HEIGHT - FILAS*TAMANO + 2);
			ctx.fillStyle = "black";
			ctx.fillRect(0, FILAS*TAMANO, COLS*TAMANO, 1);
			ctx.fillText("Puntos: " + puntos, COLS*2, FILAS*TAMANO + 45 );
			ctx.fillText("Record: " + best, TAMANO*COLS*0.7, FILAS*TAMANO + 45 );
		}
	}
	//--------------------------
	function main() {
		canvas = document.createElement("canvas");
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		ctx = canvas.getContext("2d");
		document.body.appendChild(canvas);
		ctx.font = "20px helvetica";
		ctx.strokeStyle = "white";
		
		canvas.addEventListener("click", function(){
			var posX, posy, x, y;
			posX = event.x - canvas.offsetLeft;
			posY = event.y - canvas.offsetTop;
			x = Math.floor(posX / TAMANO);
			y = Math.floor(posY / TAMANO);
			if (escenario.cuadro[x][y] !== undefined && escenario.cuadro[x][y].seleccionado === false) {
				cuantos = 0;
				vecinos(escenario, x,y);
				if (cuantos > 1) {
					puntos += (cuantos-1)*(cuantos-1);
					desplazarAbajo();
					desplazarIzquierda();
					escenario.draw();
					compTermino();
				}
			}
		});
		canvas.addEventListener("contextmenu", function(){
			event.preventDefault();
		});
		
		init();
		
	}
	
	function init() {
		escenario.init();
		escenario.draw();
	}
	
	function vecinos(celda, x, y) {
		cuantos++;
		if (cuantos > 1) {
			celda.cuadro[x][y].seleccionado = true;
		}
		var w,z=1;
		for (w=-1; w < 2; w++) {
			for (z=-1; z < 2; z++) {
				if (y+z >= 0 && y+z < FILAS &&  x+w >= 0 && x+w < COLS && Math.abs(w) !== Math.abs(z)) {
					if (celda.cuadro[x+w][y+z].seleccionado === false && celda.cuadro[x+w][y+z].valor === celda.cuadro[x][y].valor) {						
						vecinos(celda, x+w, y+z);
					}
				}
			}
		}
	}
	
	function desplazarAbajo() {
		var x, y, z;
		for (x=0; x < COLS; x++) {
			for (y=FILAS-1; y > 0; y--) {
				if (escenario.cuadro[x][y].seleccionado === true) {
					for (z=y-1; z >= 0; z--) {
						if (escenario.cuadro[x][z].seleccionado === false ) {
							escenario.cuadro[x][y].valor = escenario.cuadro[x][z].valor;
							escenario.cuadro[x][y].seleccionado = false;
							escenario.cuadro[x][z].seleccionado = true;
							break;
						}
					}				
				}
			}
		}
	}
	
	function desplazarIzquierda() {
		var x, y, z, w;
		aux = 0;
		for (y=COLS-1; escenario.cuadro[y][FILAS-1].seleccionado === true ; y--) {
			aux ++;
		}
		for (x=0; x < COLS- aux; x++) {
			if (escenario.cuadro[x][FILAS-1].seleccionado === false) {
				continue;
			}
			else {  //Despejar lo que quedo a la derecha
				for (w = x+1; w < COLS-aux;  w++) {
					for (z = 0; z < FILAS; z++) {
						escenario.cuadro[w-1][z].valor = escenario.cuadro[w][z].valor;
						escenario.cuadro[w-1][z].seleccionado = escenario.cuadro[w][z].seleccionado;
						escenario.cuadro[w][z].seleccionado = true;
					}
				}
				desplazarIzquierda();
				return;
			}
		}
	}
	
	function compTermino() {
		var x, y;
		for (x=0; x < COLS-1; x++) {
			for (y=FILAS-1; y > 0 ; y--) {
				if (escenario.cuadro[x][y].seleccionado === false) {
					if (escenario.cuadro[x][y-1].seleccionado !== true && escenario.cuadro[x][y].valor === escenario.cuadro[x][y-1].valor) {
						return;
					}
					if (escenario.cuadro[x+1][y].seleccionado !== true && escenario.cuadro[x][y].valor === escenario.cuadro[x+1][y].valor) {
						return;
					}
				}
				else {
					break;
				}
			}
		}
		//Se termino el juego
		if (puntos > best) {
			best = puntos;
			localStorage.setItem("adlrg_same_best", best);
		}
		alert("FIN DEL JUEGO\n" + "Puntuacion: " + puntos + "\nMejor puntuacion: " + best);
	}
	
	main();
}