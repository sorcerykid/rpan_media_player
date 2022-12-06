function VideoPlayer( video_id, c_play_id, p_gauge2_id, p_timer1_id, p_timer2_id )
{
	let video_elem = document.getElementById( video_id );
	let c_play_elem = document.getElementById( c_play_id );
	let p_timer1_elem = document.getElementById( p_timer1_id );
	let p_timer2_elem = document.getElementById( p_timer2_id );
	let p_gauge2_elem = document.getElementById( p_gauge2_id );
	
	let start_time = null;
	let end_time = null;
	let duration = null;
	
	let formatTimer = function ( secs )
	{
		return sprintf( "%d:%02d:%02d",
			Math.floor( Math.floor( secs ) / 3600 ),
			Math.floor( Math.floor( secs ) % 3600 / 60 ),
			Math.floor( secs ) % 60 );
	}
	
	this.getCurrentTime = function ( )
	{
		return video_elem.currentTime - start_time;
	}
	
	this.load = function ( filespec )
	{
		video_elem.style.display = 'block';
		video_elem.src = 'file:///' + filespec;
	}
	
	this.play = function ( )
	{
		if( video_elem.paused ) {
			c_play_elem.innerHTML = '&#xe60b';
			video_elem.play( );
			this.onPlay( );
		}
		else {
			c_play_elem.innerHTML = '&#xe624';
			video_elem.pause( );
			this.onStop( );
		}
	}
	
	this.stop = function ( t )
	{
		c_play_elem.innerHTML = '&#xe624';
		video_elem.pause( );
		this.onStop( );
	}
	
	this.scan = function ( t )
	{
		video_elem.currentTime =
			Math.min( Math.max( start_time, video_elem.currentTime + t ), end_time );
		updateProgress( );
		this.onSeek( );
	}
	
	this.jump = function ( e )
	{
		let rect = e.currentTarget.getBoundingClientRect( );
		let ratio = ( e.clientX - rect.left ) / ( rect.right - rect.left );
		video_elem.currentTime = start_time + duration * ratio;
		updateProgress( );
		this.onSeek( );
	}
	
	let resetProgress = function ( )
	{
		start_time = video_elem.currentTime;
		end_time = video_elem.duration;
		duration = end_time - start_time;
		p_timer1_elem.innerHTML = formatTimer( 0 );
		p_timer2_elem.innerHTML = formatTimer( end_time - start_time );
	}
	
	let updateProgress = function ( )
	{
		p_timer1_elem.innerHTML = formatTimer( video_elem.currentTime - start_time );
		p_gauge2_elem.style.width = Math.max( 5,
			( video_elem.currentTime - start_time ) / duration * 100 ) + '%';
	}

	video_elem.addEventListener( 'ended', this.stop );
	video_elem.addEventListener( 'canplaythrough', function ( ) {
		setTimeout( resetProgress, 100 );  // hack to get start time
		setInterval( updateProgress, 1000 );  // update every 1.0 secs
	} );
	
	return this;
}