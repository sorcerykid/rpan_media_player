function VideoPlayer( video_id, c_play_id, s_gauge2_id, s_mute_id, 
	s_state_id, p_gauge2_id, p_timer1_id, p_timer2_id )
{
	let video_elem = document.getElementById( video_id );
	let c_play_elem = document.getElementById( c_play_id );
	let s_gauge2_elem = document.getElementById( s_gauge2_id );
	let s_mute_elem = document.getElementById( s_mute_id );
	let s_state_elem = document.getElementById( s_state_id );
	let p_gauge2_elem = document.getElementById( p_gauge2_id );
	let p_timer1_elem = document.getElementById( p_timer1_id );
	let p_timer2_elem = document.getElementById( p_timer2_id );
	
	let start_time = null;
	let end_time = null;
	let duration = null;
	
	let rescale = function ( ratio, factor )
	{
		return Math.round( ratio / factor * 100 ) / 100 * factor;
	}
	
	let formatTimer = function ( secs )
	{
		return sprintf( "%d:%02d:%02d",
			Math.floor( Math.floor( secs ) / 3600 ),
			Math.floor( Math.floor( secs ) % 3600 / 60 ),
			Math.floor( secs ) % 60 );
	}
		
	let resetVideoProgress = function ( )
	{
		start_time = video_elem.currentTime;
		end_time = video_elem.duration;
		duration = end_time - start_time;
		p_timer1_elem.innerHTML = formatTimer( 0 );
		p_timer2_elem.innerHTML = formatTimer( end_time - start_time );
	}
	
	let updateVideoProgress = function ( )
	{
		let elapsed = video_elem.currentTime - start_time;
		p_timer1_elem.innerHTML = formatTimer( elapsed );
		p_gauge2_elem.style.width = ( elapsed / duration * 100 ) + '%';
	}
	
	let updateAudioSettings = function ( )
	{
		s_gauge2_elem.style.width = video_elem.muted ?
			'0%' : ( video_elem.volume * 100 ) + '%';
		s_mute_elem.innerHTML = video_elem.muted? '&#xe69f;' : '&#xe692;';
		s_state_elem.innerHTML = Math.round( video_elem.volume * 100 );
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
		updateVideoProgress( );
		this.onSeek( );
	}
	
	this.jump = function ( e )
	{
		let rect = e.currentTarget.getBoundingClientRect( );
		let ratio = ( e.clientX - rect.left ) / ( rect.right - rect.left );
		video_elem.currentTime = start_time + duration * rescale( ratio, 1 );
		updateVideoProgress( );
		this.onSeek( );
	}

	this.audio = { };  // provide audio sub-context
	
	this.audio.mute = function ( )
	{
		video_elem.muted = !video_elem.muted;
		updateAudioSettings( );
	}
	
	this.audio.fade = function ( e )
	{
		video_elem.muted = false;
		let rect = e.currentTarget.getBoundingClientRect( );
		let ratio = ( e.clientX - rect.left ) / ( rect.right - rect.left );
		video_elem.volume = rescale( ratio, 5 );
		updateAudioSettings( );
	}
	
	video_elem.addEventListener( 'ended', this.stop );
	video_elem.addEventListener( 'canplaythrough', function ( ) {
		updateAudioSettings( );
		setTimeout( resetVideoProgress, 100 );  // hack to get start time
		setInterval( updateVideoProgress, 500 );  // update every 0.5 secs
	} );
	
	return this;
}
