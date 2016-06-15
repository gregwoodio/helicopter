$(document).ready(function() {
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	var h = 220; //starting height of the helicopter
	var p = 400; //the height of the passage, this decreases as the game goes on
	var isFalling = true;
	var scoreSubmitted = false;
	var game = true;
	var walls = new Array();
	var counter = 0;
	var score = 0;
	var scoreModifier = 1;
	var helicopterRise = document.getElementById("helicopterRise");
	var helicopterFall = document.getElementById("helicopterFall");
	var boom = document.getElementById("boom");
	var wallColour = getRandomColor();
	var spaceColour = getRandomColor();

	for (i = 0; i < 26; i++) { //here we're making 25 sections of wall, even though 0-24 only show at once. The extra scrolls in.
		walls[i] = new Array();
	}
	var variance = 15; //The maximum difference by which the walls change

	ctx.fillStyle="blue";
	ctx.fillRect(60,(h+20),20,20);

	function setWallStart() {
		//Find a starting position for the walls. The rest of the walls will be based on this first one.
		walls[0] = new Array();
		walls[0][0] = p;
		walls[0][1] = Math.floor(Math.random() * (500 - p));
		walls[0][2] = 500 - walls[0][0] - walls[0][1];
		
		//fill in the rest of the array of the walls.
		for (i = 1; i < walls.length; i++) { //there are 25 sections of wall, we've already done the first
			walls[i][0] = p;
			walls[i][1] = walls[i-1][1] + Math.floor(Math.random() * variance * 2 - variance);
			
			if (walls[i][1] < 1) {
				walls[i][1] = 5; //Make sure the walls don't go off the board.
			}
			walls[i][2] = 500 - walls[i][0] - walls[i][1];
			if (walls[i][2] < 1) {
				walls[i][2] = 5;
			}
		}
		
		for (i = 0; i < (walls.length - 1); i++) {
			//draw the walls
			//top wall
			ctx.fillStyle = wallColour;
			ctx.fillRect((i * 30), 0, 30, walls[i][1]); 
			//bottom wall
			ctx.fillStyle = wallColour;
			ctx.fillRect((i * 30), (500-walls[i][2]), 30, 500); 
		}
	}

	function getRandomColor() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}

	function rise() {
		if (game == true) {
			isFalling = false;
			ctx.fillStyle = spaceColour;
			ctx.fillRect(60,(h+20),20,20);
			h-=3;
			ctx.drawImage(helicopterRise,60,(h + 20));
		}
	}

	function fall() {
		if (game == true) {
			isFalling = true;
			ctx.fillStyle = spaceColour;
			ctx.fillRect(60,(h+20),20,20);
			h+=1;
			ctx.drawImage(helicopterFall,60,(h + 20));
		}
	}

	function scrollWall() {
		//This scrolls the wall in from the right.
		counter += 5;
		score += (1 * scoreModifier);
		
		if ((counter % 30) == 0) {
			walls.shift();
			upper = walls[24][1] + Math.random() * variance * 2 - variance;
			upper = (upper < 1) ? 5 : upper; //if less than the top set to 5
			lower = 500 - p - upper;
			//if lower than bottom set to 5
			if (lower < 1) {
				lower = 5;
				upper = 495 - p;
			}; 
			walls.push([p, upper, lower]);
		}
		
		//This makes the game harder as it goes. The passageway gets narrower every 300 counters.
		if (counter % 500 == 0) {
			if (p > 150) {
				p -= 5;
			} else if (p < 150) {
				variance += 5;
			}
		}
		
		//This changes the colour of the walls as you go.
		/*if (counter % 5000 == 0) {
			wallColour = getRandomColor();
			spaceColour = getRandomColor();
		}*/

		//first erase the old walls
		ctx.fillStyle = spaceColour;
		ctx.fillRect(0, 0, 750, 500);
		
		if (isFalling == true) {
			fall();
		} else if (isFalling == false) {
			rise();
		}
			
		for (i = 0; i < (walls.length - 1); i++) {
			//draw the walls
			//top wall
			ctx.fillStyle = wallColour;
			ctx.fillRect((i * 30), 0, 30, walls[i][1]); 
			//bottom wall
			ctx.fillStyle = wallColour;
			ctx.fillRect((i * 30), (500-walls[i][2]), 30, 500); 
		}
		
		checkLose();
		
		//draw the score.
		ctx.fillStyle = "black";
		ctx.font = "30px Arial";
		ctx.fillText("Score: " + score, 550, 480);
	}

	function checkLose() {
		if ((h + 20) < walls[2][1] || (h+40) > (500 - walls[2][2])) {
			//add an explosion
			ctx.drawImage(boom,50,(h+10));
			game = false;
			//add the "Play again?" text.
			ctx.fillStyle = "black";
			ctx.font = "30px Arial";
			ctx.fillText("Press R to play again", 215, 250);
			ctx.fillText("or S to submit your score", 185, 300);
		} 
	}


	setInterval(function() {
		if (game == true) {
			scrollWall();	
		}
	}, 1);

	function resetGame() {
		game = true;
		score = 0;
		counter = 0;
		isFalling = true;
		scoreSubmitted = false;
		h = 220; //starting height of the helicopter
		p = 400; //the height of the passage, this decreases as the game goes on
		wallColour = getRandomColor();
		spaceColour = getRandomColor();
		walls = new Array();	
		for (i = 0; i < 26; i++) { //here we're making 25 sections of wall, even though 0-24 only show at once. The extra scrolls in.
			walls[i] = new Array();
		}
		var variance = 15; //The maximum difference by which the walls change
		setWallStart();
	}

	function showScores() {
		$.ajax({
			url: "getscore.php",
			type: "POST",
			dataType: "html",
			success: function(players) {
				for (i = 0; i < players.length; i++) {
					$("#table").append("<tr><td>" + atob(players[i]["PlayerName"]) + "</td><td>" + players[i]["Score"] + "</td></tr>");
				}
			}
		});
	}

	function submitScore() {
		var username = prompt("Enter your name:");
		username = btoa(username);

		$.ajax({
			url: "logscore.php",
			type: "POST",
			data: {"username": username, "score": score},
			success: function() {
				showScores();
			}
		});	
	}

	$(document).keypress(function(event) {
		if (game) {
			rise();
		}
	});

	$(document).keydown(function(e) {
		if (e.keyCode == 82) { //push r to reset
			resetGame();
		}
	});

	$(document).keydown(function(e) {
		if (e.keyCode == 83 && !game && !scoreSubmitted) { //push s to submit score
			submitScore();
			scoreSubmitted = true;
		}
	});

	$(document).keyup(function(event) {
		fall();
	});

	$(document).mousedown(function(event) {
		if (game) {
			rise();
		}
	});

	$(document).mouseup(function(event) {
		fall();
	});

	showScores();
	setWallStart();
});
