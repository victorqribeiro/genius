(()=>{
let colorChangeFeedback,
    playPatternRate,
    maxTimeAllowed,
    audioContext,
    oscillator,
    buttons,
    pattern,
    radial,
    action,
    sound,
    turn,
    cnf,
    go,
    i

const $ = _ => document.querySelector(_)

const init = () => {
	colorChangeFeedback = 250
	playPatternRate = $('#speed').value
	maxTimeAllowed = 3000
	outerCirle = Math.min(innerWidth, innerHeight) * 0.4
	pattern = []
	turn = 0
	i = 0
	sound = $('#sound').checked
	const letters = ['a','w','d','s']
	const directions = ['\u2190','\u2191','\u2192','\u2193']
	let texts = []
	for(let i = 0; i < 4; i++){
		let t = !(i % 2) ? "" : " "
		if( $('#letters').checked )
			t += letters[i]
		if( $('#numbers').checked )
			t += i+1
		if( $('#directions').checked )
			t += directions[i]
		texts.push(t)
	}
	buttons = [
		{text: texts[0], backgroundColor: 'hsl(0,40%,50%)', freq: 523.3, action: computer => changeColor(computer,buttons[0])},
		{text: texts[1], backgroundColor: 'hsl(50,40%,50%)', freq: 587.3, action: computer => changeColor(computer,buttons[1])},
		{text: texts[2], backgroundColor: 'hsl(100,40%,50%)', freq: 659.3, action: computer => changeColor(computer,buttons[2])},
		{text: texts[3], backgroundColor: 'hsl(220,40%,50%)', freq: 698.5, action: computer => changeColor(computer,buttons[3])}
	]
	cnf = {
		innerCircle: outerCirle-outerCirle * 0.75,
		outerCircle: outerCirle,
		posX: innerWidth/2 - outerCirle-15,
		posY: innerHeight/2 - outerCirle-15,
		fontSize: 40,
		textColor: 'white',
		isFixed: true,
		buttons: buttons,
		rotation: Math.PI/4 * 3
	}
	if(sound){
		audioContext = new AudioContext()
		oscillator = audioContext.createOscillator()
		oscillator.type = 'sine'
		oscillator.start()
	}
	radial = new RadialMenu(cnf)
	computerPlay()
}

const changeColor = (computer=false,button) => {
	if(action)
		return
	if(!computer && !turn)
		return gameOver('Wait for the Go! signal.')
	if(!computer && turn && performance.now() - go > maxTimeAllowed)	
		return gameOver('You took too long.')
	if(!computer && turn && buttons.indexOf(button) != pattern[i++])
		return gameOver('You got the sequence wrong.')
	action = true
	go = performance.now()
	const tmp = button.backgroundColor
	button.backgroundColor = tmp.replace(/[0-9]+\%/, '100%')
	radial.draw()
	if(sound){
		oscillator.frequency.value = button.freq
		oscillator.connect(audioContext.destination)
	}
	setTimeout( () => {
		button.backgroundColor = tmp
		radial.draw()
		if(sound){
			oscillator.disconnect()
		}
		action = false
		if(!computer && turn && i == pattern.length){
			setTimeout( () => {
				radial.c.fillStyle = 'black'
				radial.c.fillText("Nice!", radial.w2-42, radial.h2+10)
				if(sound){
					oscillator.type = 'triangle'
					oscillator.frequency.value = 600
					oscillator.connect(audioContext.destination)
					setTimeout( () => {
						oscillator.type = 'sine'
						oscillator.disconnect()
					}, 200) 
				}
				computerPlay()
			}, 500)
		}
	}, colorChangeFeedback)
}

const computerPlay = () => {
	setTimeout( () => {
		i = 0
		turn = 0
		pattern.push(Math.floor(Math.random()*buttons.length))
		playPattern()
	}, 1000)
}

const playPattern = () => {
	if(i < pattern.length){
		buttons[pattern[i++]].action(true)
		setTimeout( playPattern, playPatternRate )
	}else{
		i = 0
		turn = 1
		radial.c.fillStyle = 'black'
		radial.c.fillText("Go!", radial.w2-30, radial.h2+10)
		if(sound){
			oscillator.type = 'triangle'
			oscillator.frequency.value = 500
			oscillator.connect(audioContext.destination)
			setTimeout( () => {
				oscillator.type = 'sine'
				oscillator.disconnect()
			}, 200) 
		}
		go = performance.now()
	}
}

const gameOver = msg => {
	if(sound){
		oscillator.type = 'sawtooth'
		oscillator.frequency.value = 500
		oscillator.connect(audioContext.destination)
		setTimeout( () => {
			oscillator.type = 'sine'
			oscillator.disconnect()
			oscillator.stop()
		}, 300) 
	}
	radial.hide()
	radial.canvas.remove()
	$('#msg').innerText = msg
	$('#level').innerText = pattern.length
	$('#endScreen').style.display = 'flex'
	$('#restart').focus()
}

const addEvents = () => {
	$('#start').onclick = () => {
		init()
		$('#startScreen').style.display = 'none'
	}
	
	$('#restart').onclick = () => {
		$('#startScreen').style.display = 'flex'
		$('#endScreen').style.display = 'none'
	}

	document.body.addEventListener('keydown', e => {
		switch(e.keyCode){
			case 65:
			case 97:
			case 49:
			case 37:
					buttons[0].action()
				break
			case 87:
			case 98:
			case 50:
			case 38:
					buttons[1].action()
				break
			case 68:
			case 99:
			case 51:
			case 39:
					buttons[2].action()
				break
			case 83:
			case 100:
			case 52:
			case 40:
					buttons[3].action()
				break
		}
	})
}

addEvents()
})()
